(function (app)
{
    'use strict';

    medicationsController.$inject = ['$scope', 'dataService'];

    function medicationsController($scope, dataService)
    {
        var self = this;
        self.loading = false;
        self.ready = false;
        self.error = "";
        self.data = [];

        self.approved = false;

        self.approve = function ()
        {
            self.approved = !self.approved;
            dataService.checkAllApproved();
            
            dataService.approveSection("medications", self.approved);
        }

        self.expand = function (item)
        {
            item.expanded = !item.expanded;
        }

        self.select = function (item)
        {
            item.selected = !item.selected;
        }

        function loadData()
        {
            self.loading = true;
            dataService.getData('MedicationStatement').then(function (data)
            {
                console.log('got data');
                console.log(data);
                if (typeof data != "undefined" && data != null)
                {
                    self.data = data;
                }
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

    app.component('medications', {
        templateUrl: function ()
        {
            return "./src/js/app/medications/medications.html?v=2";
        },
        controller: medicationsController,
    });

}) (angular.module(constants.appName));
