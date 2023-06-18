import axios from 'axios';
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
const onlineSync = async () => {
  if (globalQuerryStorage.length > 0) {
    try {
      for (const i of globalQuerryStorage) {
        if (i.data.type === 'modifiedArticle') {
          const articleID = i.data.articleID;
          const response = await axios.put(
            `${API_URL}/article/saveUpdatedArticle/${articleID}`,
            {
              nazov: i.data.nazov,
              kategoria: i.data.kategoria,
              obsah: i.data.obsah,
            },
          );
        } else if (i.data.type === 'newArticle') {
          const response = await axios.post(`${API_URL}/article/new`, {
            autor_id: i.data.autor_id,
            nazov: i.data.nazov,
            kategoria: i.data.kategoria,
            obsah: i.data.obsah,
          });
        } else if (i.data.type === 'deleteArticle') {
          const id = i.data.articleID;
          const response = await axios.delete(`${API_URL}/article/${id}`);
        } else if (i.data.type === 'uploadPhoto') {
          const userID = i.data.userID;
          const formdata = new FormData();
          formdata.append('obrazok', {
            name: i.data.photo_name,
            uri: i.data.photo_uri,
            type: i.data.photo_type,
          });

          const res = await axios.put(
            `${API_URL}/user/updatePhoto/${userID}`,
            formdata,
            {
              headers: {
                accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
            },
          );
        }
      }
    } catch (error) {
    }
    globalQuerryStorage.splice(0, globalQuerryStorage.length);
    await asyncStorage.removeItem('global');
    await asyncStorage.removeItem('photo_uri');
    console.debug('all memory flushed');
  }
};

export default onlineSync;
