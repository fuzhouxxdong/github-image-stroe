exports.install = function (Vue) {
    Vue.prototype.github = {
        client_id: 'your client id',
        client_secret: 'your client secret',
        name: 'your github username',
        email: 'your github email',
        owner: 'repos owner',
        repos: 'repos'
    }
};
