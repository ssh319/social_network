const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@assets': path.resolve(__dirname, 'src/assets'),
            '@styles': path.resolve(__dirname, 'src/styles'),
            '@context': path.resolve(__dirname, 'src/context')
        }
    }
}