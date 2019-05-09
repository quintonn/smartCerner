(function (app)
{
    'use strict';

    DataMenuController.$inject = ['dataService', '$scope', '$rootScope'];

    function DataMenuController(dataService, $scope, $rootScope)
    {
        var self = this;

        self.menu = [];
        self.menu.push({ id: "patient", name: "Patient Demographics" });
        self.menu.push({ id: "gp", name: "GP Practice" });
        self.menu.push({ id: "diagnosis", name: "Diagnoses" });
        self.menu.push({ id: "summary", name: "Clinical Summary" });
        self.menu.push({ id: "medications", name: "Medications & Medical Devices" });
        self.menu.push({ id: "allergies", name: "Allergies & Adverse Reactions" });
        self.menu.push({ id: "admission", name: "Admission Details" });
        self.menu.push({ id: "assessment", name: "Assessment Scales" });
        self.menu.push({ id: "dischargeDetails", name: "Discharge Details" });
        self.menu.push({ id: "distribution", name: "Distribution List" });
        self.menu.push({ id: "requirements", name: "Individual Requirements" });
        self.menu.push({ id: "advice", name: "Information & Advice Given" });
        self.menu.push({ id: "investigation", name: "Investigation Results" });
        self.menu.push({ id: "legal", name: "Legal Information" });
        self.menu.push({ id: "research", name: "Participation in Research" });
        self.menu.push({ id: "concerns", name: "Patient & Carer Concerns, Expectations & Wishes" });
        self.menu.push({ id: "person", name: "Person Completing Record" });
        self.menu.push({ id: "plan", name: "Plan & Requested Actions" });
        self.menu.push({ id: "procedures", name: "Procedures" });
        self.menu.push({ id: "referrer", name: "Referrer Details" });
        self.menu.push({ id: "safety", name: "Safety Alerts" });
        self.menu.push({ id: "social", name: "Social Context" });
        
        self.activeMenu = self.menu[0].id;

        self.selectMenu = function (menu)
        {
            self.activeMenu = menu.id;
        }

        self.fhirMessage = { name: 'test' };

        self.isValid = function(menu)
        {
            var result = dataService.sectionApproved.indexOf(menu.id) != -1;
            return result;
        }

        self.validSummary = false;
        self.validAllergies = false;
        self.validPatient = false;

        self.$onInit = function ()
        {
            $scope.$watch(function ()
            {
                return dataService.sectionApproved;
            },
                function (newVal, oldVal)
                {
                    console.log(newVal);
                });

            $rootScope.$on('fhirChange', function (evt, fhirMessage)
            {
                self.fhirMessage = JSON.stringify(fhirMessage, null, 2);
            });
            
            $scope.$watch(function ()
            {
                return dataService.fhirMessage;
            },
                function (newVal, oldVal)
                {
                    console.log('setting fhir message to');
                    console.log(newVal);
                    self.fhirMessage = JSON.stringify(newVal, null, 2);
                });
        }
    }

    app.component('discharge', {
        templateUrl: function ()
        {
            return "./src/js/app/discharge/discharge.html";
        },
        controller: DataMenuController,
    });

})(angular.module(constants.appName));
