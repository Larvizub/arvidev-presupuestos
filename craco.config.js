module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
