(function (app)
{
    'use strict';

    gpController.$inject = ['$scope', 'dataService'];

    function gpController($scope, dataService)
    {
        var self = this;
        self.loading = false;
        self.ready = false;
        self.error = "";
        self.data = {};

        self.approved = false;

        self.approve = function ()
        {
            self.approved = !self.approved;
            dataService.checkAllApproved();
            dataService.approveSection("gp", self.approved);
        }

        function loadData()
        {
            self.loading = true;

            dataService.getData('Organization').then(function (data)
            {
                console.log(data);
                data = data[0];
                self.data = data;
                self.ready = true;
            }).catch(function (err)
            {
                console.log(err);
                self.error = err;
            }).then(function ()
            {
                self.loading = false;

                $scope.$apply();
            });
        }

        self.loading = true;
        setTimeout(function ()
        {
            loadData();
        }, 1000);
    }

    app.component('gp', {
        templateUrl: function ()
        {
            return "./src/js/app/gp/gp.html?v=1";
        },
        controller: gpController,
    });

}) (angular.module(constants.appName));
