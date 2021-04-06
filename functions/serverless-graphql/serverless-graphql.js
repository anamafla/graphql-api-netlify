const ApolloServerLambda = require("apollo-server-lambda").ApolloServer;
const { gql } = require("apollo-server-lambda");

const admin = require("firebase-admin");

require("dotenv").config();

const credential = {
  type: JSON.parse(process.env.JSON_DATA).type,
  project_id: JSON.parse(process.env.JSON_DATA).project_id,
  private_key_id: JSON.parse(process.env.JSON_DATA).private_key_id,
  private_key: JSON.parse(process.env.JSON_DATA).private_key,
  client_email: JSON.parse(process.env.JSON_DATA).client_email,
  client_id: JSON.parse(process.env.JSON_DATA).client_id,
  auth_uri: JSON.parse(process.env.JSON_DATA).auth_uri,
  token_uri: JSON.parse(process.env.JSON_DATA).token_uri,
  auth_provider_x509_cert_url: JSON.parse(process.env.JSON_DATA)
    .auth_provider_x509_cert_url,
  client_x509_cert_url: JSON.parse(process.env.JSON_DATA).client_x509_cert_url
};

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
