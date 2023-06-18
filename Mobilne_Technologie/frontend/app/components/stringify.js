function ObjectToString(){
  try {
    for(const i of globalQuerryStorage){
      JSON.stringify(i);
    }
  } catch (err) {
    console.error(err);
  }
}

export default ObjectToString;
