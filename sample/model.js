function AppModel() {

}

AppModel.prototype = {
    doThis: function (query$name) {
        return {
            hello: query$name
        }
    },

    deep: {

        here: function (bean$service, query$name) {
            return bean$service.asyncService(query$name);
        }

    }
}

module.exports = new AppModel;