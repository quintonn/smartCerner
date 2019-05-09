(function (app)
{
    'use strict';

    allergiesController.$inject = ['$scope', 'dataService'];

    function allergiesController($scope, dataService)
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
            
            dataService.approveSection("allergies", self.approved);
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
            dataService.getData('AllergyIntolerance').then(function (data)
            {
                console.log('************************');
                console.log(data);
                console.log('************************');
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

    app.component('allergies', {
        templateUrl: function ()
        {
            return "./src/js/app/allergies/allergies.html";
        },
        controller: allergiesController,
    });

}) (angular.module(constants.appName));
