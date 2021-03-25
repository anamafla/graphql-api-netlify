// const { ApolloServer, gql } = require("apollo-server-lambda");

// const typeDefs = gql`
//   type Query {
//     hello: String
//     allAuthors: [Author!]
//     author(id: Int!): Author
//     authorByName(name: String!): Author
//   }
//   type Author {
//     id: ID!
//     name: String!
//     married: Boolean!
//   }
// `;

// const authors = [
//   { id: 1, name: "Terry Pratchett", married: false },
//   { id: 2, name: "Stephen King", married: true },
//   { id: 3, name: "JK Rowling", married: false }
// ];

// const resolvers = {
//   Query: {
//     hello: (root, args, context) => {
//       return "Hello, world!";
//     },
//     allAuthors: (root, args, context) => {
//       return authors;
//     },
//     author: (root, args, context) => {
//       return;
//     },
//     authorByName: (root, args, context) => {
//       console.log("hihhihi", args.name);
//       return authors.find(x => x.name === args.name) || "NOTFOUND";
//     }
//   }
// };

// const server = new ApolloServer({
//   typeDefs,
//   resolvers
// });

// exports.handler = server.createHandler();

const ApolloServerLambda = require("apollo-server-lambda").ApolloServer;
const { gql } = require("apollo-server-lambda");

const admin = require("firebase-admin");

const credential = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(credential)
});

const typeDefs = gql`
  type Video {
    id: ID
    description: String
    videoUrl: String
    subtitle: String
    thumb: String
    name: String
    slug: String
    duration: Int
    sort: Int
    isCompleted: Boolean
    category: String
  }

  type Sections {
    id: ID!
    name: String
    sort: Int
    videos: [Video]
  }

  type Query {
    hello: String
    # video(id: ID!): Video
    videos: [Video]
    sections: [Sections]
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hola desde Cali - La Sucursal del Cielo 🤠.",
    sections: async () => {
      const sections = await admin
        .firestore()
        .collection("sections")
        .get();

      sections.docs.forEach(section =>
        console.log(section.id, "=>", section.data())
      );

      return sections.docs.map(section => section.data());
    },
    videos: async () => {
      const videos = await admin
        .firestore()
        .collection("sections")
        .doc("1")
        .collection("videos")
        .get();

      videos.forEach(video => {
        console.log("Found video with name:", video.data().name);
      });

      return videos.docs.map(video => video.data());
    }
  }
};

const server = new ApolloServerLambda({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
