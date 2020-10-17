const csv_file = "./../public/data/County_Geocode.csv";

const addBtn = "#addBtn";
const table = "#dataTable";
const stateInput = "#stateInput";
const countyInput = "#countyInput";

let colors = [
    'rgb(166, 105, 43)',
    'rgb(166, 135, 43)',
    'rgb(166, 166, 43)',
    'rgb(135, 166, 43)',
    'rgb(105, 166, 43)',
    'rgb(74, 166, 43)',
    'rgb(43, 166, 43)',
    'rgb(43, 166, 74)',
    'rgb(43, 166, 105)',
    'rgb(43, 166, 135)',
    'rgb(43, 166, 166)',
    'rgb(43, 135, 166)',
    'rgb(43, 105, 166)',
    'rgb(43, 74, 166)',
    'rgb(43, 43, 166)',
    'rgb(74, 43, 166)',
    'rgb(105, 43, 166)',
    'rgb(135, 43, 166)',
    'rgb(166, 43, 166)',
    'rgb(166, 43, 135)',
    'rgb(166, 43, 105)',
    'rgb(166, 43, 74)',
    'rgb(166, 43, 43)',
];

let DAYS_BEFORE = 21;
let state_county = [];
let temp = {};

var GLOBAL_STATE = undefined;
var GLOBAL_COUNTY = undefined;

let chart = undefined;

let config = {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: [],
        datasets: [],
    },

    // Configuration options go here
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Chart.js Line Chart'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Dates'
                },
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                }
            }]
        }
    }
}


function addDataPlot(x, y, myLabel) {
    // var colorName = colorNames[config.data.datasets.length % colorNames.length];
    // var newColor = window.chartColors[colorName];
    config.data.labels = x;
    let color = colors[Math.floor((Math.random() * colors.length) + 1)];
    var newDataset = {
        label: myLabel,
        backgroundColor: color,
        borderColor: color,
        data: y,
        fill: false
    };

    config.data.datasets.push(newDataset);
    chart.update();
}

function removePlot(_county) {

    if (_county == undefined || _county.length == 0) {
        return;
    }

    for (index in chart.data.datasets) {
        if (chart.data.datasets[index].label == _county) {
            chart.data.datasets.splice(index, 1);
            chart.update();
            break;
        }
    }
}



/**
 * add values to html table
 * @param  {Arra[Object]} data  state string
 * @returns {boolean} true is data was added
 */
async function add_values_to_table(data) {

    let xData = [];
    let yData = [];

    for (indx in data) {

        let template = ` 
        <tr class="${data[indx]["geo_value"]}">
            <td>${data[indx]["geo_value"]}</td>
            <td>${data[indx]["time_value"]}</td>
            <td>${data[indx]["direction"]}</td>
            <td>${data[indx]["issue"]}</td>
            <td>${data[indx]["lag"]}</td>
            <td>${data[indx]["value"]}</td>
        </tr>`;

        xData.push(data[indx]["time_value"]);
        yData.push(data[indx]["value"]);

        $(`${table} > tbody:last-child`).append(template);
    }

    let county = await get_county_by_code(data[0]["geo_value"]);
    addDataPlot(xData, yData, county);
}

var callback = function(result, message, epidata) {
    console.log(result, message, epidata != null ? epidata.length : void 0);
    if (epidata != undefined && epidata.length > 0) {
        add_values_to_table(epidata);
    }

    // else notify the user

};

/**
 * convert string data to csv
 * @param  {String} data  string of data
 * @returns {Array[Object]} array with all values of the csv
 */
function csv_to_array(data) {

    let fips_idx = 0,
        county_idx = 1,
        state_idx = 2;

    let temp_data = [];

    if (data == undefined) {
        return undefined;
    }

    let arr = data.split("\n");

    if (arr.length > 0) {
        arr.splice(0, 1);
    }

    for (index in arr) {
        line = arr[index].trim().split(',');
        temp_data.push({ "FIPS": line[fips_idx], "county": line[county_idx], "state": line[state_idx] })
    }

    return temp_data;
}

/**
 * read a file a convert to csv
 * @param  {String} file csv file data
 * @returns {Array} array with all values of the csv
 */
function read_csv(file) {
    return new Promise(async function(resolve, reject) {

        let data;
        data = await $.ajax({
            type: "GET",
            url: file,
            dataType: "text",
            success: function(response) {
                return response;
            }
        });
        data = csv_to_array(data);

        if (data == undefined || data.length == 0) {
            return reject("Error getting the data");
        }
        resolve(data);
    });

}

/**
 * convert string data to csv
 * @param  {String} state  state string
 * @param {String} county county string
 * @returns {Array[Object]} array with all values of the csv
 */
async function get_code_by_state_county(state, county) {

    state = state.toLocaleLowerCase();
    county = county.toLocaleLowerCase();

    let result = await read_csv(csv_file);

    let found_state = result.filter(element => element["state"].toLocaleLowerCase() == state);

    if (found_state.length == 0) {
        return null;
    }

    let found_state_and_county = found_state.filter(element => element["county"].toLocaleLowerCase() == county);

    if (found_state_and_county.length == 0) {
        return null;
    }

    return found_state_and_county[0]["FIPS"];
}

async function get_county_by_code(code) {

    let result = await read_csv(csv_file);

    let found_county = result.filter(element => element["FIPS"].toLocaleLowerCase() == code);

    console.log(found_county);
    if (found_county.length == 0) {
        return null;
    }
    return found_county[0]["county"];
}

/**
 * 
 * @param {String} state 
 * @param {String} county 
 */
function createPlot(state, county) {

    return new Promise(async function(resolve, reject) {

        //let table_row = `<tr> <td> XXX </td> <td> YYY </td> <td><button id="btnDelete">Delete</button></td> </tr> `;
        let table_row = `<tr id='ZZZ'> <td> XXX </td> <td> YYY </td> <td> <i style="color: red;" class="fa fa-trash btnTrash" aria-hidden="true"> </i> </td> </tr> `;

        let isDuplicate = false;
        state_county.forEach(dict => {
            if (Object.keys(dict).length > 0) {
                Object.keys(dict).forEach(inner => {
                    console.log(dict[inner], " == ", state + county, (state + county) == dict[inner]);
                    if ((state + county) == dict[inner]) {
                        isDuplicate = true;
                    }
                });
            }
        });

        if (isDuplicate) return reject(false);

        let code = await get_code_by_state_county(state, county);
        code = code.toString();
        code = (code.length != 5) ? `0${code}` : code;

        // state_county_arr.push(state + county);
        table_row = table_row.replace("XXX", state);
        table_row = table_row.replace("YYY", county);
        table_row = table_row.replace("ZZZ", code);
        temp[code] = state + county;
        state_county.push(temp);
        temp = {};

        // add the table
        // $('#state_county_table > tbody').last().after(table_row);
        $(`#state_county_table > tbody:last-child`).append(table_row);


        today = parseInt(get_days_before(null, true));
        xDaysBefore = parseInt(get_days_before(DAYS_BEFORE + 1, true));

        GLOBAL_COUNTY = county;
        GLOBAL_STATE = state;

        Epidata.covidcast(callback, 'indicator-combination', 'confirmed_7dav_incidence_prop', 'day', 'county', [Epidata.range(xDaysBefore, today)], code);
        resolve(true);
    });
}

function get_days_before(time, justNumber = false) {

    let today = new Date();

    if (time != null) {
        today.setDate(today.getDate() - time);
    }

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (justNumber) {
        month = (month < 10) ? `0${month}` : month;
        return `${year}${month}${day}`;
    }

    return `${month}/${day}/${year}`;
}

// SPFJER


$(document).ready(async function() {

    ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, config);

    await createPlot("WA", "Franklin");
    await createPlot("WA", "Benton");

    $(addBtn).click(async function() {


        let state = $(stateInput).val();
        let county = $(countyInput).val();

        await createPlot(state, county);
    });

    $("#export").click(function() {
        var image = myChart.toBase64Image();
        // $("#dataTable").tableToCSV("data.csv");
    });


    $('body').on('click', 'i.btnTrash', function() {

        let id = $(this).parent().parent().attr('id').toString();

        let _county = $(`#${id} td:nth-child(2)`).text().trim();

        // console.log("COUNTY: ", _county);

        // console.log("ID TO DELETE: ", id);
        state_county = state_county.filter(dict => {

            let condition = (id in dict);

            if (!condition) {
                return true;
            }
            return false;
        });

        // console.log(state_county)
        $(this).parent().parent().remove();

        $(`.${id}`).remove();
        removePlot(_county);

    });

    // TIME PERIOD
    $("#time-period-title").text(DAYS_BEFORE);
    $("#date_1").text(get_days_before(null));
    $("#date_2").text(get_days_before(DAYS_BEFORE));

});
// $('.list').on('click', 'span', (e) => {
//     $(e.target).parent().remove();
//   });




/* TODO: for the date in the box 
      ************* REMEMBER TO SEARCH FOR JQUERY ****************

    1. Create a new id for the box - text is prefered
    2. do the logic to get the today's date, and X days laters
    3. update the text using the id you got

    NOTES:
        class --> .
        id --> #
*/