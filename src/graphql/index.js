import { gql } from "apollo-server-express";
import { User } from "../features/user.js";
import { Book } from "../features/book.js";
import { issueToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

export const typeDefs = gql`
  type User { id: ID!, name: String, email: String, role: String }
  type Book { id: ID!, title: String, author: String, genre: String, copies: Int }
  type Query {
    me: User
    books: [Book]
  }
  type Mutation {
    register(name: String!, email: String!, password: String!): String
    login(email: String!, password: String!): String
  }
`;

export const resolvers = {
  Query: {
    me: (_, __, { user }) => user,
    books: () => Book.find()
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      return `Registered: ${user.email}`;
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error("Invalid credentials");
      return issueToken(user);
    }
  }
};
