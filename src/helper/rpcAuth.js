export default function (auth) {
  if (auth.password === process.env.RPC_PASSWORD) {
    return true;
  }

  return false;
}
