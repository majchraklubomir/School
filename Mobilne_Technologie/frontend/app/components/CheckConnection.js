import 'abortcontroller-polyfill';
const checkConnection = async () => {
  const AbortController = window.AbortController;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 600); // abort after 300 ms
  const resp = await fetch(`${API_URL}/connection/checkConnection`, {
    signal: controller.signal,
  });
  if (!resp.ok) {
    throw new Error(`HTTP error! status: ${resp.status}`);
  }
};

export default checkConnection;
