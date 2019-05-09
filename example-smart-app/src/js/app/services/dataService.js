(function (app)
{
    'use strict';

    var dischargeReady = false;

    function dataService()
    {
        var self = this;
        self.smart = null;
        self.ready = false;

        var service =
        {
            data: {},
            getData: getData,
            //getAllergies: getAllergies,
            //getMedications: getMedications,
            allergies: [],
            fhirMessage: null,
            medications: [],
            summary: "",
            error: "",
            isValid: isValid,            
            checkAllApproved: checkAllApproved,
            canSubmit: false,
            sectionApproved: [],
            approveSection: approveSection
        };

        function getData(key)
        {
            if (dischargeReady == false && service.error == "")
            {
                return new Promise(function (res, rej)
                {
                    setTimeout(function ()
                    {
                        return getData(key).then(function (resp)
                        {
                            res(resp);
                        }).catch(rej);
                    }, 100);
                });
            }
            if (service.error != "")
            {
                return Promise.reject(service.error);
            }
            //console.log('data element:');
            //console.log(service.data);
            //console.log('getting data for key ' + key);
            return Promise.resolve(service.data[key]);
        }

        function getDischargeSummary(patient, user, encounter, fhirServer, token)
        {
            var rhapsodyServer = "https://18.222.191.253:29999/smart/cerner";

            var userParts = user.split("/");
            user = userParts[userParts.length - 1];
            var url = rhapsodyServer + "?patientId=" + patient + "&encounterId=" + encounter + "&practitionerId=" + user;
            url += "&fhirServer=" + encodeURIComponent(fhirServer);
            
            url += "&token=" + token;

            //console.log(url);

            $.ajax({
                type: "GET",
                url: url,
                headers: {
                    "Accept": "application/json",
                },
                crossDomain: true,
            }).done(function (resp)
            {
                //console.log('got discharge response');
                //console.log(resp);

                for (var i = 0; i < resp.entry.length; i++)
                {
                    var entry = resp.entry[i];
                    if (typeof entry.resource != 'undefined' && entry.resource != null)
                    {
                        if (entry.resource.resourceType == "List")
                        {
                            continue;
                        }
                        else
                        {
                            //console.log('busy with ' + entry.resource.resourceType);
                            if (service.data[entry.resource.resourceType] == null)
                            {
                                service.data[entry.resource.resourceType] = [];
                            }

                            //console.log('adding ' + entry.resource.resourceType + ' to data');
                            //console.log(entry.resource);
                            if (entry.resource.resourceType == "AllergyIntolerance" ||
                                entry.resource.resourceType == "MedicationStatement")
                            {
                                entry.resource['selected'] = true;
                            }
                            service.data[entry.resource.resourceType].push(entry.resource);
                        }
                    }
                }
                service.fhirMessage = resp;

                dischargeReady = true;

            }).fail(function (jqXHR, textStatus, errorThrown)
            {
                console.log('fail', jqXHR, textStatus, errorThrown);
            });
        }

        function approveSection(section, approve)
        {
            if (approve == true && service.sectionApproved.indexOf(section) == -1)
            {
                service.sectionApproved.push(section);
                service.sectionApproved = service.sectionApproved.filter(function (value, index, arr)
                {
                    return true;
                });
            }
            else if (approve == false && service.sectionApproved.indexOf(section) > -1)
            {
                service.sectionApproved = service.sectionApproved.filter(function (value, index, arr)
                {

                    return value != section;
                });
            }
        }

        function checkAllApproved()
        {
            service.canSubmit = approveSection.length >= 2;

            return service.canSubmit;
        }

        function isValid(value)
        {
            if (typeof value == "undefined" || value == null || value == null || value.length == 0)
            {
                return false;
            }
            return true;
        }

        /*function getAllergies()
        {
            if (self.ready == false && service.error == "")
            {
                return new Promise(function (res, rej)
                {
                    setTimeout(function ()
                    {
                        return getAllergies().then(function (resp)
                        {
                            res(resp);
                        }).catch(rej);
                    }, 100);
                });
            }
            if (service.error != "")
            {
                return Promise.reject(service.error);
            }

            var allergies = self.smart.patient.api.fetchAll({ type: "AllergyIntolerance" });

            return new Promise(function (res, rej)
            {
                $.when(allergies).fail(function (e)
                {
                    rej(e);
                });

                $.when(allergies).done(function (allergies)
                {
                    service.allergies = allergies;
                    res(allergies);
                });
            });
        }

        function getMedications()
        {
            if (self.ready == false && service.error == "")
            {
                return new Promise(function (res, rej)
                {
                    setTimeout(function ()
                    {
                        return getMedications().then(function (resp)
                        {
                            res(resp);
                        }).catch(rej);
                    }, 100);
                });
            }
            if (service.error != "")
            {
                return Promise.reject(service.error);
            }

            var medications = self.smart.patient.api.fetchAll({ type: "MedicationStatement" });

            return new Promise(function (res, rej)
            {
                $.when(medications).fail(function (e)
                {
                    rej(e);
                });

                $.when(medications).done(function (medications)
                {
                    service.medications = medications;
                    res(medications);
                });
            });
        }*/

        function onReady(smart, a, b, c)
        {
            self.smart = smart;
            self.ready = true;

            console.log(smart);
            try
            {
                getDischargeSummary(smart.tokenResponse.patient, smart.userId, smart.tokenResponse.encounter, smart.server.serviceUrl, smart.tokenResponse.access_token);
            }
            catch (err)
            {
                console.log(err);
            }

            console.log(window.location.href);
            //$('#loading').hide();
        }

        function onError(e)
        {
            console.log(e);
            service.error = e;
            self.ready = false;
            onReady();
        }
        
        try
        {
            /*
            var x= FHIR.oauth2.authorize({
                'client_id': '2335dd3f-27a5-4780-8654-b068f85afaf6',
                'scope': 'patient/Patient.read patient/Observation.read patient/Encounter.read patient/AllergyIntolerance.read user/Patient.read user/Observation.read user/Encounter.read launch/patient launch/encounter online_access openid profile'
            });
            console.log('xxxxxx');
            console.log(x);
            */
        }
        catch (err)
        {
            console.log("ERROR");
            console.log(err);
        }
        console.log(window.location.href);

        FHIR.oauth2.ready(onReady, onError);

        //getAuthToken();

        return service;
    }

    function getAuthToken()
    {
        console.log('getting auth token');
        var params = getParams();

        var data =
        {
            grant_type: "authorization_code",
            client_id: "e392d189-e1d8-46f5-ae3f-3263d5edbbe2",
            redirect_uri: "https://quintonn.github.io/smartCerner/example-smart-app/",
            code: params.code,
            state: params.state
        };

        $.ajax({
            type: "POST",
            url: "https://authorization.sandboxcerner.com/tenants/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/protocols/oauth2/profiles/smart-v1/token",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            }   ,
            data: data,
            success: function ()
            {
                console.log('post success');
            },
        }).done(function (resp)
        {
            console.log('done', resp);
        }).fail(function (jqXHR, textStatus, errorThrown)
        {
            console.log('fail', jqXHR, textStatus, errorThrown);
        });
    }

    function getParams()
    {
        var url = window.location.href;
        console.log(url);
        var parts = url.split('?');
        if (parts.length == 1)
        {
            console.log('no params in url');
            console.log(parts);
            return {};
        }

        var params = parts[1];
        console.log(params);
        params = params.split('&');
        console.log(params);
        var result = {};
        params.forEach(function (item)
        {
            console.log(item);
            var parts = item.split('=');
            var key = parts[0];
            var value = parts[1];
            result[key] = value;
        });
        console.log('getParams result', result);
        return result;
    }

    app.service('dataService', dataService);

})(angular.module(constants.appName));
