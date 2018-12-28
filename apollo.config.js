module.exports = {
  client: {
    service: {
      name: 'pronunciation-service',
      endpoint:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:4001/graphql'
          : 'https://owk36r3y7g.execute-api.us-east-1.amazonaws.com/dev/graphql',
    },
  },
};
