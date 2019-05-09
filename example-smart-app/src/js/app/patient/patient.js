(function (app)
{
    'use strict';

    PatientController.$inject = ['$scope', 'dataService'];

    function PatientController($scope, dataService)
    {
        var self = this;
        self.loading = false;
        self.ready = false;
        self.error = "";

        self.firstName = "";
        self.lastName = "";
        self.gender = "";
        self.birthDate = '';
        self.deathDate = '';

        self.approved = false;

        self.approve = function ()
        {
            self.approved = !self.approved;
            dataService.checkAllApproved();
            dataService.approveSection("patient", self.approved);
        }

        function loadData()
        {
            self.loading = true;

            dataService.getData('Patient').then(function (data)
            {
                console.log(data);
                data = data[0];
                self.gender = data.gender;
                self.firstName = data.name[0].given.join(' ');
                self.lastName = data.name[0].family;//.join(' ');
                self.birthDate = data.birthDate;
                self.address = data.address[0].line.join('\n') + "\n" + data.address[0].city + '\n' + data.address[0].postalCode;

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

    app.component('patient', {
        templateUrl: function ()
        {
            return "./src/js/app/patient/patient.html?v=2";
        },
        controller: PatientController,
    });

}) (angular.module(constants.appName));
