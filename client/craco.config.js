const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@styles': path.resolve(__dirname, 'src/styles'),
            '@context': path.resolve(__dirname, 'src/context'),
            '@utils': path.resolve(__dirname, 'src/utils')
        }
    }
}