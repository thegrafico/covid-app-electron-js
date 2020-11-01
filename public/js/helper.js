const csv_file = "./../public/data/County_Geocode.csv";

const addBtn = "#addBtn";
const table = "#dataTable";
const stateInput = "#stateInput";
const countyInput = "#countyInput";
const differenceAvailableDateFromApi = "#differenceAvailableDateFromApi";
const availableDataFromApi_1 = "#availableDataFromAPI_1";
const availableDataFromApi_2 = "#availableDataFromAPI_2";


const available = "available";
const unavailable = "unavailable";

const COLORS = {
    'rgb(0, 0, 0)': available,
    'rgb(0, 0, 128)': available,
    'rgb(186, 216, 10)': available,
    'rgb(0, 188, 242)': available,
    'rgb(104, 33, 122)': available,
    'rgb(236, 0, 140)': available,
    'rgb(240, 50, 230)': available,
    'rgb(255, 140, 0)': available,
    'rgb(60, 180, 75)': available,
    'rgb(0, 130, 200)': available,
    'rgb(145, 30, 180)': available,
    'rgb(70, 240, 240)': available,
    'rgb(210, 245, 60)': available,
    'rgb(232, 17, 35)': available,
    'rgb(170, 255, 195)': available,
    'rgb(255, 225, 25)': available,
    'rgb(128, 128, 0)': available,
    'rgb(0, 158, 73)': available,
};

let DAYS_BEFORE = 16;
let state_county = [];
let temp = {};
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
            text: 'Covid-19 Infection Rates per 100,000 People at the Selected Travel Locations'
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
                    labelString: 'COVID-19 Infection Rate per 100,000 People'
                }
            }]
        }
    }
}

/**
 * 
 * @param {Number} x  - x-data for the plot
 * @param {Number} y - y-data for the plot
 * @param {Object} state_county - key value for state and county
 */
function addDataPlot(x, y, state_county) {

    const { state, county } = state_county;

    config.data.labels = x;

    let color = undefined;

    // check for the keys
    for (let key in COLORS) {
        if (COLORS[key] == available) {
            color = key;
            break;
        }
    }

    // default in case of error

    if (!color) { color = 'rgb(255, 0, 0)' };
    var newDataset = {
        label: `${state}, ${county}`,
        backgroundColor: color,
        borderColor: color,
        data: y,
        fill: false
    };

    if (!((state.toLocaleLowerCase() == "wa") && (county.toLocaleLowerCase() == "benton" || county.toLocaleLowerCase() == "franklin"))) {
        newDataset["borderDash"] = [10, 5]
    }

    // console.log("Adding a color: ", COUNTER);
    config.data.datasets.push(newDataset);
    chart.update();

    COLORS[color] = unavailable;
    console.log("COLORS USED: ", COLORS);

}

function removePlot(_county) {

    if (_county == undefined || _county.length == 0) {
        return;
    }
    for (index in chart.data.datasets) {

        if (chart.data.datasets[index].label.toLocaleLowerCase().trim() == _county.toLocaleLowerCase().trim()) {
            COLORS[chart.data.datasets[index].backgroundColor] = available;

            console.log("COLORS USED: ", COLORS);

            chart.data.datasets.splice(index, 1);
            chart.update();
            // console.log("County removed");
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

    let { state, county } = await get_state_and_county_by_code(data[0]["geo_value"]);
    let maxDate = data[0]["time_value"];
    let minDate = data[0]["time_value"];
    let diff = 0;
    for (indx in data) {

        let template = ` 
        <tr class="${data[indx]["geo_value"]}">
            <td>${state}</td>
            <td>${county}</td>
            <td>${data[indx]["geo_value"]}</td>
            <td>${data[indx]["time_value"]}</td>
            <td>${data[indx]["direction"]}</td>
            <td>${data[indx]["issue"]}</td>
            <td>${data[indx]["lag"]}</td>
            <td>${data[indx]["value"]}</td>
        </tr>`;

        maxDate = (maxDate < data[indx]["time_value"]) ? data[indx]["time_value"] : maxDate;
        minDate = (minDate > data[indx]["time_value"]) ? data[indx]["time_value"] : minDate;

        xData.push(data[indx]["time_value"]);
        yData.push(data[indx]["value"]);

        $(`${table} > tbody:last-child`).append(template);
    }

    diff = (maxDate - minDate).toString();
    maxDate = maxDate.toString();
    minDate = minDate.toString();

    setHtmlDate(maxDate, availableDataFromApi_1);
    setHtmlDate(minDate, availableDataFromApi_2);
    $(differenceAvailableDateFromApi).text(diff);



    // console.log("COUNTY TO SET: ", _county);
    addDataPlot(xData, yData, { state, county });
}

function setHtmlDate(date, id) {

    let year = date.substring(0, 4);
    let month = date.substring(4, 6);
    let day = date.substring(6);

    $(id).text(`${month}/${day}/${year}`);
}

var callback = function(result, message, epidata) {


    console.log(result, message, epidata != null ? epidata.length : void 0);

    if (epidata != undefined && epidata.length > 0) {

        add_values_to_table(epidata);
    } else {
        console.log("Cannot find anything");
        // alert("Cannot find any data for the specify request");
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

async function get_state_and_county_by_code(code) {

    let result = await read_csv(csv_file);

    let found_county = result.filter((element) => {
        let fipsCode = element["FIPS"].toLocaleLowerCase();

        fipsCode = (fipsCode.length == 4) ? `0${fipsCode}` : fipsCode;

        return fipsCode == code;
    });

    if (found_county.length == 0) {
        return null;
    }
    return { county: found_county[0]["county"], state: found_county[0]["state"] };
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
                    // console.log(dict[inner], " == ", state + county, (state + county) == dict[inner]);
                    if ((state + county) == dict[inner]) {
                        isDuplicate = true;
                    }
                });
            }
        });

        if (isDuplicate) return reject(false);

        let code = await get_code_by_state_county(state, county);

        if (!code) { return; };

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
        // console.log("DATE BEFORE: ", xDaysBefore);

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
        day = (day < 10) ? `0${day}` : day;

        return `${year}${month}${day}`;
    }

    return `${month}/${day}/${year}`;
}

$(document).ready(async function() {

    ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, config);

    await createPlot("WA", "Franklin");
    await createPlot("WA", "Benton");

    $(addBtn).click(async function() {


        let state = $(stateInput).val();
        let county = $(countyInput).val();

        if (state == undefined || county == undefined || !isNaN(state) || !isNaN(county)) {
            // notify the user here
            return;
        }

        await createPlot(state, county);
    });

    $("#export").click(function() {
        // var image = myChart.toBase64Image();
        $("#dataTable").tableToCSV("data.csv");
    });


    $('body').on('click', 'i.btnTrash', function() {

        let id = $(this).parent().parent().attr('id').toString();

        let _state = $(`#${id} td:nth-child(1)`).text().trim();
        let _county = $(`#${id} td:nth-child(2)`).text().trim();

        //console.log("COUNTY: ", _county);
        //console.log("ID TO DELETE: ", id);


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
        removePlot(`${_state}, ${_county}`);

    });

    $("#download").on("click", function() {
        // /*Get image of canvas element*/

        var url_base64jp = document.getElementById("myChart").toDataURL("image/jpg");
        this.href = url_base64jp;
    });
    // TIME PERIOD
    $("#time-period-title").text(DAYS_BEFORE);
    $("#date_1").text(get_days_before(null));
    $("#date_2").text(get_days_before(DAYS_BEFORE));
});