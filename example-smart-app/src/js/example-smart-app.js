(function(window){
  window.extractData = function() {
    console.log('extract data');

    var encounterId = getEncounterId();
    
    var ret = $.Deferred();

    function onError(e) {
      console.log(e);
      console.log('Loading error', arguments);
      //ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        console.log('reading patient');
        
        var pt = patient.read();
        console.log('reading observations 1');
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                    }
                  });
        console.log('reading observations 2');

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {

          console.log('got all info');
          console.log(patient);
          console.log(obv);

          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });

        console.log(smart);
        //console.log(smart.encounter);

        var allergies = smart.patient.api.fetchAll({type: "AllergyIntolerance"});

        $.when(allergies).fail(onError);

        $.when(allergies).done(function(allergies) 
        {
            console.log('got all allergies');
            console.log(allergies);

            var allergyTable = $("#allAllergies");
            allergyTable.empty();

            allergies.forEach(function(allergy)
            {
                var category = allergy.category;
                var substance = "";
                if (typeof allergy.substance.text != "undefined")
                {
                   substance = allergy.substance.text;
                }
                else
                {
                  substance = allergy.substance.coding[0].display;
                }
                var status = allergy.status;
                allergyTable.append("<tr><th>Allergy: "+substance+" </th><td>"+status+" ("+category+")</td></tr>");
            });

        });

        var obvAll = smart.patient.api.fetchAll({type: 'Observation'});
        var encAll = smart.patient.api.fetchAll({type: 'Encounter'});
        //var encAll = smart.patient.api.search({type: 'Encounter'});
        var usr = smart.user.read();

        $.when(obvAll, encAll, usr).fail(onError);

        $.when(obvAll, encAll, usr).done(function(obvAll, encAll, usr) {

          console.log('got all observations & encounters & user');

          console.log(usr);

          console.log(obvAll);

          console.log(encAll);

          var observationTable = $("#allObservations");
          observationTable.empty();

          var encounterTable = $("#allEncounter");
          encounterTable.empty();

          encAll.forEach(function(encounter)
          {
             encounterTable.append("<tr><th>Encounter: "+encounter.id+" </th><td>"+encounter.status+"</td></tr>");
          });

          obvAll.forEach(function(observation) 
          {
              if (typeof observation.code != 'undefined' && observation.code != null)
              {
                //var code = observation.code.text;
                var encounter = "";
                if (typeof observation.encounter != "undefined")
                {
                  encounter = observation.encounter.reference;
                }
                var obsData = getObsValue(observation, encounter);
                obsData.forEach(function(item)
                {
                  observationTable.append("<tr><th>"+item.code+":</th><td>"+item.value+"</td><td>"+item.encounter+"</td></tr>");
              });
              }
              else
              {
                console.log('observation has no codes');
                console.log(typeof observation.code);
                console.log(observation.code);
                console.log(observation);
              }
          });
        });


      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function getObsValue(obs, encounter)
  {
    var results = [];

    if (typeof obs != 'undefined')
    {
       if (typeof obs.valueQuantity != 'undefined' && typeof obs.valueQuantity.value != 'undefined')
       {
          var result = obs.valueQuantity.value;
          if (typeof obs.valueQuantity.unit != 'undefined')
          {
            result = result + ' ' + obs.valueQuantity.unit;
          }
          results.push({code: obs.code.text, value: result, encounter: encounter});
       }
       else if (typeof obs.valueCodeableConcept != 'undefined' && typeof obs.valueCodeableConcept.text != 'undefined')
       {
          results.push({code: obs.code.text, value: obs.valueCodeableConcept.text, encounter: encounter});
          
       }
       else if (typeof obs.valueString != 'undefined')
       {
        results.push({code: obs.code.text, value: obs.valueString, encounter: encounter});
       }
       else if (typeof obs.valueBoolean != 'undefined')
       {
          results.push({code: obs.code.text, value: obs.valueBoolean, encounter: encounter});
       }
       else if (typeof obs.valueInteger != 'undefined')
       {
          results.push({code: obs.code.text, value: obs.valueInteger, encounter: encounter});
       }
       else if (typeof obs.valueDateTime != 'undefined')
       {
          results.push({code: obs.code.text, value: obs.valueDateTime, encounter: encounter});
       }
       else if (typeof obs.component != 'undefined' && obs.component.length > 0)
       {
          console.log('trying to add from component');
          console.log(obs);
          obs.component.forEach(function(comp)
          {
              var items = getObsValue(comp, encounter);
              items.forEach(function(tmp)
              {
                results.push(tmp);
              });
          });
       }
       else 
       {
        console.log('observation value is unhandled at this time:');
        console.log(obs);
      }
    } 

      return results;
  }

  function getEncounterId(data)
  {
    try
    {
        console.log(window.location.href);
        var codeIndex = window.location.href.indexOf('code=');
        var code = window.location.href.substring(codeIndex+5);
        console.log(code);
        var end = code.indexOf("&");
        console.log(end);

        code = code.substring(0, end);
        console.log(code);

        code = Base64.decode(code);
        console.log(code);

        var rex = new RegExp('encounter.*?(}|,)');
        var matches = rex.exec(code);
        code = matches[0];
        console.log(code);

        rex = new RegExp("(.*:)((\"|').*(\"|'))");
        matches = rex.exec(code);
        console.log(matches);
        code = matches[2];
        console.log(code);
        code = code.replace(/"/g, "").replace(/'/g, "");
        console.log(code);
        
        return code;
    }
    catch (err)
    {
      console.log(err);
    }
  }

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
