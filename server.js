const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router("db.json")
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// 👇 custom login
server.post("/users/login", (req, res) => {
  const { email, password } = req.body
  const db = router.db

  const user = db.get("users").find({ email, password }).value()

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  res.json({ user })
})

server.use(router)

server.listen(3001, () => {
  console.log("JSON Server is running on port 3001")
})
