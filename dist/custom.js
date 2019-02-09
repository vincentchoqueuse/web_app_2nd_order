$(function () {
    
    $("#Inputtype").change(function () {
           type = $("#Inputtype").val();
           switch(type) {
                case "lp":
                    $("#label_T").text("Gain T0");
                    break;
                case "bp":
                    $("#label_T").text("Gain Tmax");
                    break;
                case "hp":
                    $("#label_T").text("Gain Too");
                    break;
                   }
            });

    $("#monformulaire").submit(function( event ) {
                               
            var poles;
            var zeros;
            var impulse;
            var step;
            var num
                               
            type = $("#Inputtype").val();
            m = 1.0*$("#Inputm").val();
            T = 1.0*$("#InputT").val();
            w0 = 1.0*$("#Inputw0").val();
            
            switch(type) {
                  case "lp":
                        num = [T];
                        break;
                    case "bp":
                        num = [2*m*T/w0,0];
                        break;
                    case "hp":
                        num = [T/(w0*w0),0,0];
                        break;
                }
            den = [(1/(w0*w0)),2*m/w0,1];
            num = num.join(",");
            den = den.join(",");
            T_max =5/(w0);
            url = "https://bzhjqstm3f.execute-api.eu-west-1.amazonaws.com/dep?num="+num+"&den="+den+"&tmax="+T_max;
                    
            $("#btn_submit").prop("disabled",true);
            $("#btn_submit").text("Please Wait ...");
            $.ajax({
                url: url,
                context: document.body
                }).done(function(data) {
                        poles = data.poles;
                        zeros = data.zeros;
                        impulse = data.impulse;
                        step = data.step;
                        freq = data.freq;
                        
                        // Poles and zeros
                        max=0;
                        series_poles=[];
                        series_zeros=[];
                        for (var indice=0;indice<poles.real.length;indice++)
                        {
                            series_poles.push([poles.real[indice],poles.imag[indice]]);
                            max = Math.max(max,Math.abs(poles.real[indice]));
                            max = Math.max(max,Math.abs(poles.imag[indice]));
                        }
                        for (var indice=0;indice<zeros.real.length;indice++)
                        {
                            series_zeros.push([zeros.real[indice],zeros.imag[indice]]);
                            max = Math.max(max,Math.abs(zeros.real[indice]));
                            max = Math.max(max,Math.abs(zeros.imag[indice]));
                        }
                        
                        chart_pz.series[0].update({data: series_zeros}, true);
                        chart_pz.yAxis[0].setExtremes(-max,max);
                        chart_pz.series[1].update({data: series_poles}, true);
                        chart_pz.xAxis[0].setExtremes(-max,max);
                        

                        // time response
                        chart_step.series[0].update({pointInterval: step.Te, data: step.data}, true);
                        chart_imp.series[0].update({pointInterval: impulse.Te, data: impulse.data}, true);
                        
                        // frequency response
                        series_abs=[];
                        series_angle=[];
                        for (var indice=0;indice<freq.w.length;indice++)
                        {
                            series_abs.push([freq.w[indice],freq.data_abs[indice]]);
                            series_angle.push([freq.w[indice],freq.data_angle[indice]]);
                        }
                        chart_freq.series[0].update({data: series_abs}, true);
                        chart_freq.series[1].update({data: series_angle}, true);
                        
                        $("#btn_submit").prop("disabled",false);
                        $("#btn_submit").text("Submit");
                        });

              event.preventDefault();
              });
    
    Highcharts.setOptions({chart: {type: 'line',resetZoomButton: {theme: {display: 'none'}}},credits: {enabled: false},title: {text: ''}, });
    
    var chart_pz = Highcharts.chart("chart_pz",
           {
           xAxis: {title: {text: "Real Part"},type: "linear",gridLineWidth: 1,},
           yAxis: {title:{text:"Imaginary Part"},type: "linear",gridLineWidth: 1},
           plotOptions: {scatter: {marker: { radius: 5, states: { hover: { enabled: true, lineColor: 'rgb(100,100,100)'}}},
                        tooltip: { headerFormat: '<b>{series.name}</b><br>', pointFormat: '{point.x}, {point.y}'}}
                    },
          navigation: {buttonOptions: {enabled: false}},
          series: [{name: 'Zeros',type: 'scatter',color: 'rgba(223, 83, 83, .5)',data: [[0,0]],},
                   {name: 'Poles',type: 'scatter',color: 'rgba(119, 152, 191, .5)',data: [[0,0]],},
                   ],
          });

    var chart_step = Highcharts.chart("chart_step",
            {
            plotOptions: {line: {marker: { enabled: false }}},
            xAxis: {title: {text: "Time"},type: "linear",},
            yAxis: [{title:{text:"Reponse"},type: "linear"},
                    ],
            series: [{name: 'step',color: 'rgba(223, 83, 83, .5)',data: [[0,0]],}],
            });
    
    var chart_imp = Highcharts.chart("chart_imp",
          {
          plotOptions: {line: {marker: { enabled: false }}},
          xAxis: {title: {text: "Time"},type: "linear",},
          yAxis: {title:{text:"Reponse"},type: "linear"},
          series: [{name: 'step',color: 'rgba(223, 83, 83, .5)',data: [[0,0]],}],
          });
    
    var chart_freq = Highcharts.chart("chart_freq",
         {
         plotOptions: {line: {marker: { enabled: false }}},
         xAxis: {title: {text: "Angular Frequency (rad/s)"},type: "logarithmic",},
         yAxis: [{title:{text:"module"},type: "logarithmic"},{title:{text:"phase"},opposite: true}],
        series: [{animation: false,name: "Amplitude", yAxis: 0, color: "#e26856", data: [[0.1, 0],[1, 0]]},
                   {animation: false, name: "Phase",color: "#EF889D",yAxis: 1,data: [[0.1, 0],[1, 0]]},],
         });
    
    $("#monformulaire").submit();
    
    });
