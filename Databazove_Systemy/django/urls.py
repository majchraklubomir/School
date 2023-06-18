"""djangoProject1 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('v1/health/', v1_health),
    path('v2/players/<int:player_id>/game_exp/', v2_game_exp),
    path('v2/players/<int:player_id>/game_objectives/', v2_game_objectives),
    path('v2/players/<int:player_id>/abilities/', v2_abilities),
    path('v2/patches/', v2_patches),
    path('v3/matches/<int:match_id>/top_purchases/', v3_top_purchases),
    path('v3/abilities/<int:ability_id>/usage/', v3_ability_usage),
    path('v3/statistics/tower_kills/', v3_tower_kills),
    path('v4/players/<int:player_id>/game_exp/', v4_game_exp),
    path('v4/players/<int:player_id>/game_objectives/', v4_game_objectives),
    path('v4/players/<int:player_id>/abilities/', v4_abilities),
    path('v4/matches/<int:match_id>/top_purchases/', v4_top_purchases)

]
