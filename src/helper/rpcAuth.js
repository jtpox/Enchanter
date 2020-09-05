export default function (auth) {
  return auth.password === process.env.RPC_PASSWORD;
}
