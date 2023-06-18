from django.db.models import F, When, Case, Q, ExpressionWrapper, FloatField, CharField, TextField, Value, Count, Max, \
    Window
from django.db.models.functions import Coalesce, RowNumber
from django.http import JsonResponse
import os

from dotenv import load_dotenv, find_dotenv
import psycopg2

from djangoProject1.models import *


def connect():
    load_dotenv(find_dotenv())
    conn = psycopg2.connect(
        user=os.getenv("DATABASE_USERNAME"),
        password=os.getenv("DATABASE_PASSWORD"),
        host=os.getenv("DATABASE_IP"),
        port=os.getenv("DATABASE_PORT"),
        database=os.getenv("DATABASE_NAME")
    )
    return conn


def v1_health(request):
    conn = connect()
    cur = conn.cursor()
    cur.execute('SELECT version()')
    db_version = cur.fetchone()[0]
    q = "select pg_database_size('dota2')/1024/1024 as dota2_db_size;"
    cur.execute(q)
    db_size = cur.fetchone()[0]
    cur.close()
    data = {'pgsql': {'version': db_version, 'dota2_db_size': db_size}}

    return JsonResponse(data, safe=False)


def v2_patches(request):
    conn = connect()
    cur = conn.cursor()
    q1 = 'WITH cte AS( ' \
         'SELECT name patch_version, extract(epoch from release_date) patch_start_date, LEAD(extract(epoch from release_date), 1) OVER(ORDER BY name) patch_end_date ' \
         'FROM patches ' \
         ') ' \
         'SELECT c.patch_version, c.patch_start_date, c.patch_end_date, m.id, ROUND(cast(m.duration as numeric)/60, 2) ' \
         'FROM cte c ' \
         'LEFT JOIN matches m ON m.start_time BETWEEN c.patch_start_date AND c.patch_end_date '

    cur.execute(q1)
    query = cur.fetchall()
    patches = []
    i = 0
    while True:
        if i < len(query):
            matches = []
            patch_version = query[i][0]
            patch_start_date = int(query[i][1])
            patch_end_date = query[i][2]
            if patch_end_date is not None:
                patch_end_date = int(query[i][2])
            while True:
                match_id = query[i][3]
                if match_id is not None:
                    duration = float(query[i][4])
                    match = {'match_id': match_id, 'duration': duration}
                    matches.append(match)
                if i + 1 < len(query) and query[i + 1][0] == patch_version:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            patch = {'patch_version': patch_version, 'patch_start_date': patch_start_date,
                     'patch_end_date': patch_end_date, 'matches': matches}
            patches.append(patch)

        else:
            break
    cur.close()
    data = {'patches': patches}

    return JsonResponse(data, safe=False)


def v2_game_exp(request, player_id):
    conn = connect()
    cur = conn.cursor()
    q1 = 'SELECT p.id , coalesce(p.nick, {0}), mpd.match_id , h.localized_name , ROUND(cast(m.duration as numeric)/60, 2) , coalesce(mpd.xp_hero ,0) + coalesce(mpd.xp_creep ,0) + coalesce(mpd.xp_other, 0) + coalesce(mpd.xp_roshan, 0) as XP,  mpd.level, ' \
         'CASE' \
         '  WHEN m.radiant_win is True AND ( 0 <= mpd.player_slot AND mpd.player_slot <= 4) THEN True ' \
         '  WHEN m.radiant_win is False AND (128 <= mpd.player_slot AND mpd.player_slot <= 132) THEN True ' \
         '  ELSE False ' \
         'END ' \
         'FROM matches_players_details mpd ' \
         'INNER JOIN matches m ON mpd.match_id = m.id ' \
         'INNER JOIN players p ON mpd.player_id = p.id ' \
         'INNER JOIN heroes h ON mpd.hero_id = h.id ' \
         'WHERE mpd.player_id = {1} ' \
         'ORDER BY mpd.match_id ASC '.format("'unknown'", player_id)
    cur.execute(q1)
    query = cur.fetchall()
    print(q1)
    player_nick = query[0][1]
    matches = []
    for i in range(0, len(query)):
        match_id = query[i][2]
        hero_localized_name = query[i][3]
        match_duration_minutes = float(query[i][4])
        experiences_gained = query[i][5]
        level_gained = query[i][6]
        winner = query[i][7]
        match = {'match_id': match_id, 'hero_localized_name': hero_localized_name,
                 'match_duration_minutes': match_duration_minutes, 'experiences_gained': experiences_gained,
                 'level_gained': level_gained,
                 'winner': winner}
        matches.append(match)
    cur.close()
    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v2_game_objectives(request, player_id):
    conn = connect()
    cur = conn.cursor()
    q1 = 'SELECT p.id , coalesce(p.nick, {0}) , mpd.match_id , h.localized_name , coalesce(g.subtype, {1}) , ' \
         'CASE WHEN g.subtype IS NULL THEN 1 ' \
         'ELSE count(g.subtype) ' \
         'END ' \
         'FROM matches_players_details mpd ' \
         'INNER JOIN matches m ON mpd.match_id = m.id ' \
         'INNER JOIN players p ON mpd.player_id = p.id ' \
         'INNER JOIN heroes h ON mpd.hero_id = h.id ' \
         'LEFT JOIN game_objectives g ON mpd.id = g.match_player_detail_id_1 ' \
         'WHERE mpd.player_id = {2} ' \
         'GROUP BY p.id, mpd.match_id, h.localized_name, g.subtype ' \
         'ORDER BY mpd.match_id ASC '.format("'unknown'", "'NO_ACTION'", player_id)
    cur.execute(q1)
    query = cur.fetchall()
    player_nick = query[0][1]
    matches = []
    i = 0
    while True:
        if i < len(query):
            actions = []
            match_id = query[i][2]
            hero_localized_name = query[i][3]
            while True:
                hero_action = query[i][4]
                count = query[i][5]
                action = {'hero_action': hero_action, 'count': count}
                actions.append(action)

                if i + 1 < len(query) and query[i + 1][2] == match_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            match = {'match_id': match_id, 'hero_localized_name': hero_localized_name, 'actions': actions}
            matches.append(match)
        else:
            break
    cur.close()
    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v2_abilities(request, player_id):
    conn = connect()
    cur = conn.cursor()
    q1 = 'SELECT DISTINCT p.id, coalesce(p.nick, {0}), mpd.match_id, h.localized_name, a.name, count(au.ability_id) over(PARTITION BY mpd.id, au.ability_id), MAX(au.level) over(PARTITION BY mpd.id, au.ability_id) ' \
         'FROM matches_players_details mpd ' \
         'INNER JOIN matches m ON mpd.match_id = m.id ' \
         'INNER JOIN players p ON mpd.player_id = p.id ' \
         'INNER JOIN heroes h ON mpd.hero_id = h.id ' \
         'INNER JOIN ability_upgrades au ON mpd.id = au.match_player_detail_id ' \
         'INNER JOIN abilities a ON au.ability_id = a.id ' \
         'WHERE mpd.player_id = {1} ' \
         'GROUP BY p.id, mpd.match_id, h.localized_name, a.name, mpd.id, au.ability_id, au.level ' \
         'ORDER BY mpd.match_id ASC '.format("'unknown'", player_id)

    cur.execute(q1)
    query = cur.fetchall()
    player_nick = query[0][1]
    matches = []
    i = 0
    while True:
        if i < len(query):
            abilities = []
            match_id = query[i][2]
            hero_localized_name = query[i][3]
            while True:
                ability = query[i][4]
                count = query[i][5]
                level = query[i][6]
                ab = {'ability_name': ability, 'count': count, 'upgrade_level': level}
                abilities.append(ab)
                if i + 1 < len(query) and query[i + 1][2] == match_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            match = {'match_id': match_id, 'hero_localized_name': hero_localized_name, 'abilities': abilities}
            matches.append(match)
        else:
            break

    cur.close()
    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v3_top_purchases(request, match_id):
    conn = connect()
    cur = conn.cursor()
    q1 = 'WITH rownumbers as (' \
         'SELECT mpd.match_id, mpd.hero_id, h.localized_name, pl.item_id, i.name, COUNT(i.name) AS num, ROW_NUMBER() over(partition by mpd.hero_id order by COUNT(i.name) DESC, i.name ASC) rownum ' \
         'FROM matches_players_details mpd ' \
         'INNER JOIN matches m ON mpd.match_id = m.id ' \
         'INNER JOIN players p ON mpd.player_id = p.id ' \
         'INNER JOIN heroes h ON mpd.hero_id = h.id ' \
         'INNER JOIN purchase_logs pl ON mpd.id = pl.match_player_detail_id ' \
         'INNER JOIN items i ON pl.item_id = i.id ' \
         'WHERE ((m.radiant_win is True AND (0 <= mpd.player_slot AND mpd.player_slot <= 4)) OR (m.radiant_win is False AND (128 <= mpd.player_slot AND mpd.player_slot <= 132))) AND mpd.match_id = {0} ' \
         'GROUP BY mpd.match_id, mpd.hero_id, h.id, h.localized_name, pl.item_id, i.name ' \
         'ORDER BY h.id ASC, num DESC, i.name ASC ' \
         ') ' \
         'SELECT * from rownumbers ' \
         'where rownum <= 5 '.format(match_id)

    cur.execute(q1)
    query = cur.fetchall()
    heroes = []
    i = 0
    while True:
        if i < len(query):
            top_purchases = []
            hero_id = query[i][1]
            hero_localized_name = query[i][2]
            while True:
                item_id = query[i][3]
                item_name = query[i][4]
                item_count = query[i][5]
                item = {'id': item_id, 'name': item_name, 'count': item_count}
                top_purchases.append(item)
                if i + 1 < len(query) and query[i + 1][1] == hero_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            hero = {'id': hero_id, 'name': hero_localized_name, 'top_purchases': top_purchases}
            heroes.append(hero)
        else:
            break

    cur.close()
    data = {'id': match_id, 'heroes': heroes}

    return JsonResponse(data, safe=False)


def v3_ability_usage(request, ability_id):
    conn = connect()
    cur = conn.cursor()
    q1 = 'WITH buck as ( ' \
         'SELECT a.id, a.name, mpd.hero_id, h.localized_name hero_name, au.ability_id, ' \
         'CASE ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 0 AND 9 then '"'0-9'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 10 AND 19 then '"'10-19'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 20 AND 29 then '"'20-29'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 30 AND 39 then '"'30-39'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 40 AND 49 then '"'40-49'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 50 AND 59 then '"'50-59'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 60 AND 69 then '"'60-69'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 70 AND 79 then '"'70-79'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 80 AND 89 then '"'80-89'"' ' \
         'WHEN floor(au.time::float/m.duration::float*100) BETWEEN 90 AND 99 then '"'90-99'"' ' \
         'ELSE '"'100-109'"' ' \
         'END as bucket, ' \
         'CASE ' \
         'WHEN m.radiant_win is True AND ( 0 <= mpd.player_slot AND mpd.player_slot <= 4) THEN True ' \
         'WHEN m.radiant_win is False AND (128 <= mpd.player_slot AND mpd.player_slot <= 132) THEN True ' \
         'ELSE False ' \
         'END as winner ' \
         'FROM matches_players_details mpd ' \
         'JOIN matches m ON mpd.match_id = m.id ' \
         'JOIN players p ON mpd.player_id = p.id ' \
         'JOIN heroes h ON mpd.hero_id = h.id ' \
         'JOIN ability_upgrades au ON mpd.id = au.match_player_detail_id ' \
         'JOIN abilities a ON au.ability_id = a.id ' \
         'WHERE au.ability_id = {0} ' \
         '), ' \
         'second as ( ' \
         'SELECT DISTINCT id, name, hero_id, hero_name, bucket, winner, count(ability_id) over(partition by winner, bucket, ability_id, hero_id) number from buck ' \
         ') ' \
         'SELECT DISTINCT on (hero_id, id, winner) hero_id, id, winner, name, hero_name, bucket, MAX(number) over(partition by winner,bucket, hero_id) ' \
         'FROM second ' \
         'GROUP BY id, name, hero_id, hero_name, bucket, winner, number ' \
         'ORDER BY hero_id ASC,id, winner DESC, name, max DESC '.format(ability_id)

    cur.execute(q1)
    query = cur.fetchall()
    ability_id = query[0][1]
    ability_name = query[0][3]
    heroes = []
    i = 0
    while True:
        if i < len(query):
            usage_winners = None
            usage_loosers = None
            hero_id = query[i][0]
            hero_name = query[i][4]
            hero = {}
            while True:
                if query[i][2] == True:
                    bucket_winners = query[i][5]
                    bucket_winners_count = query[i][6]
                    usage_winners = {'bucket': bucket_winners, 'count': bucket_winners_count}
                elif query[i][2] == False:
                    bucket_loosers = query[i][5]
                    bucket_loosers_count = query[i][6]
                    usage_loosers = {'bucket': bucket_loosers, 'count': bucket_loosers_count}
                if i + 1 < len(query) and query[i + 1][0] == hero_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            if usage_winners is not None and usage_loosers is not None:
                hero = {'id': hero_id, 'name': hero_name, 'usage_winners': usage_winners,
                        'usage_loosers': usage_loosers}
            elif usage_winners is not None:
                hero = {'id': hero_id, 'name': hero_name, 'usage_winners': usage_winners}
            elif usage_loosers is not None:
                hero = {'id': hero_id, 'name': hero_name, 'usage_loosers': usage_loosers}
            heroes.append(hero)
        else:
            break

    cur.close()
    data = {'id': ability_id, 'name': ability_name, 'heroes': heroes}

    return JsonResponse(data, safe=False)


def v3_tower_kills(request):
    conn = connect()
    cur = conn.cursor()
    q1 = 'WITH cte as ( ' \
         'SELECT mpd.hero_id, h.localized_name, m.id, go.time ' \
         'FROM matches_players_details mpd ' \
         'JOIN matches m ON m.id = mpd.match_id ' \
         'JOIN heroes h ON h.id = mpd.hero_id ' \
         'FULL JOIN game_objectives go ON mpd.id = go.match_player_detail_id_1 ' \
         'WHERE go.subtype = '"'CHAT_MESSAGE_TOWER_KILL'"' ' \
         'GROUP BY mpd.hero_id, h.localized_name,m.id, go.subtype, go.time ' \
         'ORDER BY m.id, go.time ' \
         '), cte1 as ( ' \
         'SELECT hero_id, localized_name, id, time, SUM(CASE WHEN (hero_id = prev and id = previd) THEN 0 ELSE 1 END) OVER(ORDER BY id, time, hero_id) grp ' \
         'FROM (SELECT *, LAG(hero_id) OVER(ORDER BY id, time, hero_id) prev, LAG(id) OVER(ORDER BY id, time) previd FROM cte) s ' \
         '), cte2 as ( ' \
         'SELECT *, MAX(countGrpSeq) over(partition by hero_id) maxSeq ' \
         'FROM (SELECT *, COUNT(grp) over(partition by grp) countGrpSeq from cte1) s ' \
         'GROUP BY hero_id, localized_name,id, time, grp, countGrpSeq ' \
         'ORDER BY id,time ' \
         ') ' \
         'SELECT * from (SELECT DISTINCT on (hero_id) hero_id, localized_name, maxSeq from cte2 where hero_id is not null) s ' \
         'order by maxSeq DESC, localized_name ASC '

    cur.execute(q1)
    query = cur.fetchall()
    heroes = []
    i = 0
    while True:
        if i < len(query):
            hero_id = query[i][0]
            hero_name = query[i][1]
            tower_kills = query[i][2]
            i = i + 1
            hero = {'id': hero_id, 'name': hero_name, 'tower_kills': tower_kills}
            heroes.append(hero)
        else:
            break

    cur.close()
    data = {'heroes': heroes}

    return JsonResponse(data, safe=False)


def v4_game_exp(request, player_id):
    query = MatchesPlayersDetails.objects.using('dota2') \
        .values_list('match_id', 'hero__localized_name', 'level') \
        .annotate(nic=Coalesce('player__nick', Value('unknown'), output_field=TextField())) \
        .annotate(cas=ExpressionWrapper((F('match__duration') / 60.00), output_field=FloatField())) \
        .annotate(
        suma=Coalesce('xp_hero', 0) + Coalesce('xp_other', 0) + Coalesce('xp_creep', 0) + Coalesce('xp_roshan', 0)) \
        .annotate(
        case=Case(
            When(Q(match__radiant_win=True) & (Q(player_slot__gte=0) & Q(player_slot__lte=4)), then=True),
            When(Q(match__radiant_win=False) & (Q(player_slot__gte=128) & Q(player_slot__lte=132)), then=True),
            default=False, )).filter(player_id=player_id) \
        .order_by('match_id')
    player_nick = query[0][3]
    matches = []
    for i in range(0, len(query)):
        match_id = query[i][0]
        hero_localized_name = query[i][1]
        match_duration_minutes = round(float(query[i][4]), 2)
        experiences_gained = query[i][5]
        level_gained = query[i][2]
        winner = query[i][6]
        match = {'match_id': match_id, 'hero_localized_name': hero_localized_name,
                 'match_duration_minutes': match_duration_minutes, 'experiences_gained': experiences_gained,
                 'level_gained': level_gained,
                 'winner': winner}
        matches.append(match)
    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v4_game_objectives(request, player_id):
    query = MatchesPlayersDetails.objects.using('dota2') \
        .values_list('match_id', 'hero__localized_name') \
        .annotate(nic=Coalesce('player__nick', Value('unknown'), output_field=TextField())) \
        .annotate(subtype=Coalesce('match_player_detail_id_1__subtype', Value("NO_ACTION"), output_field=TextField())) \
        .annotate(
        case=Case(
            When(Q(match_player_detail_id_1__subtype=None), then=Value(1)),
            default=Count(F('match_player_detail_id_1__subtype', )), output_field=TextField())) \
        .filter(player_id=player_id)

    player_nick = query[0][2]
    matches = []
    i = 0
    while True:
        if i < len(query):
            actions = []
            match_id = query[i][0]
            hero_localized_name = query[i][1]
            while True:
                hero_action = query[i][3]
                count = query[i][4]
                action = {'hero_action': hero_action, 'count': count}
                actions.append(action)

                if i + 1 < len(query) and query[i + 1][0] == match_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            match = {'match_id': match_id, 'hero_localized_name': hero_localized_name, 'actions': actions}
            matches.append(match)
        else:
            break
    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v4_abilities(request, player_id):
    query = MatchesPlayersDetails.objects.using('dota2') \
        .values_list('match_id', 'hero__localized_name', 'abilityupgrades__ability__name') \
        .annotate(nic=Coalesce('player__nick', Value('unknown'), output_field=TextField())) \
        .annotate(count=Count('abilityupgrades__ability_id')) \
        .annotate(Max('abilityupgrades__level')) \
        .filter(player_id=player_id) \
        .order_by('match_id')

    player_nick = query[0][3]
    matches = []
    i = 0
    while True:
        if i < len(query):
            abilities = []
            match_id = query[i][0]
            hero_localized_name = query[i][1]
            while True:
                ability = query[i][2]
                count = query[i][4]
                level = query[i][5]
                ab = {'ability_name': ability, 'count': count, 'upgrade_level': level}
                abilities.append(ab)
                if i + 1 < len(query) and query[i + 1][0] == match_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            match = {'match_id': match_id, 'hero_localized_name': hero_localized_name, 'abilities': abilities}
            matches.append(match)
        else:
            break

    data = {'id': player_id, 'player_nick': player_nick, 'matches': matches}

    return JsonResponse(data, safe=False)


def v4_top_purchases(request, match_id):
    query = MatchesPlayersDetails.objects.using('dota2') \
        .values_list('match_id', 'hero_id', 'hero__localized_name', 'purchaselogs__item_id',
                     'purchaselogs__item__name') \
        .annotate(count=Count('purchaselogs__item__name')) \
        .order_by('hero_id', '-count', 'purchaselogs__item__name') \
        .annotate(rank=Window(expression=RowNumber(), partition_by='hero_id',
                              order_by=(F('count').desc(), F('purchaselogs__item__name').asc()))) \
        .filter(Q(match_id=match_id) & (
            (Q(match__radiant_win=True) & (Q(player_slot__gte=0) & Q(player_slot__lte=4))) | (Q(
        match__radiant_win=False) & (Q(player_slot__gte=128) & Q(player_slot__lte=132)))))

    heroes = []
    i = 0
    while True:
        if i < len(query):
            top_purchases = []
            hero_id = query[i][1]
            hero_localized_name = query[i][2]
            while True:
                item_id = query[i][3]
                item_name = query[i][4]
                item_count = query[i][5]
                rownum = query[i][6]
                item = {'id': item_id, 'name': item_name, 'count': item_count}
                top_purchases.append(item)
                if rownum == 5:
                    while True:
                        if i + 1 < len(query) and query[i + 1][1] == hero_id:
                            i = i + 1
                            continue
                        else:
                            break
                if i + 1 < len(query) and query[i + 1][1] == hero_id:
                    i = i + 1
                    continue
                else:
                    i = i + 1
                    break
            hero = {'id': hero_id, 'name': hero_localized_name, 'top_purchases': top_purchases}
            heroes.append(hero)
        else:
            break

    data = {'id': match_id, 'heroes': heroes}

    return JsonResponse(data, safe=False)
