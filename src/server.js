import http from "http";
import { ApolloServer } from "apollo-server-express";
import app from "./app.js";
import { connectDB } from "./db.js";
import { PORT } from "./config.js";
import { typeDefs, resolvers } from "./graphql/index.js";
import { verifyToken } from "./utils/jwt.js";

async function start() {
  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const user = verifyToken(token);
          return { user };
        } catch {}
      }
      return {};
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  http.createServer(app).listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
  });
}

start();
