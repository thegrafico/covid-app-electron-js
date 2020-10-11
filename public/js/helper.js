const { count } = require("console");
const { readSync } = require("fs");
const { hasUncaughtExceptionCaptureCallback } = require("process");

const csv_file = "./../public/data/County_Geocode.csv";

const addBtn = "#addBtn";
const table = "#dataTable";
const stateInput = "#stateInput";
const countyInput = "#countyInput";

let DAYS_BEFORE = 21;
let state_county = [];
let temp = {};
let INDEX = 0;



/**
 * add values to html table
 * @param  {Arra[Object]} data  state string
 * @returns {boolean} true is data was added
 */
function add_values_to_table(data) {

    let template = ` 
        <tr>
            <td>geo_value</td>
            <td>time_value</td>
            <td>direction</td>
            <td>issue</td>
            <td>lag</td>
            <td>value</td>
        </tr>`;

    for (indx in data) {

        let template = ` 
        <tr>
            <td>${data[indx]["geo_value"]}</td>
            <td>${data[indx]["time_value"]}</td>
            <td>${data[indx]["direction"]}</td>
            <td>${data[indx]["issue"]}</td>
            <td>${data[indx]["lag"]}</td>
            <td>${data[indx]["value"]}</td>
        </tr>`;

        $(`${table} > tbody:last-child`).append(template);
    }

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




$(document).ready(function() {

    $(addBtn).click(async function() {

        //let table_row = `<tr> <td> XXX </td> <td> YYY </td> <td><button id="btnDelete">Delete</button></td> </tr> `;
        let table_row = `<tr id='ZZZ'> <td> XXX </td> <td> YYY </td> <td> <i style="color: red;" class="fa fa-trash btnTrash" aria-hidden="true"> </i> </td> </tr> `;

        let state = $(stateInput).val();
        let county = $(countyInput).val();

        /* TODO: input validation
            Verify is state and county is not empty.  to notify the user use this functon -> alert("Message")
        */

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

        if (isDuplicate) return;

        // state_county_arr.push(state + county);
        table_row = table_row.replace("XXX", state);
        table_row = table_row.replace("YYY", county);
        table_row = table_row.replace("ZZZ", INDEX);
        let key = INDEX.toString();
        temp[key] = state + county;
        state_county.push(temp);
        INDEX++;



        $('#state_county_table > tbody').last().after(table_row);
        temp = {};

        let code = await get_code_by_state_county(state, county);
        code = code.toString();
        code = (code.length != 5) ? `0${code}` : code;
        Epidata.covidcast(callback, 'indicator-combination', 'confirmed_7dav_incidence_prop', 'day', 'county', [20200401, Epidata.range(20200405, 20200414)], code);
    });

    $('body').on('click', 'i.btnTrash', function() {

        let id = $(this).parent().parent().attr('id').toString();
        console.log("ID TO DELETE: ", id);
        state_county = state_county.filter(dict => {

            let condition = (id in dict);

            if (!condition) {
                return true;
            }
            return false;
        });

        console.log(state_county)
        $(this).parent().parent().remove();

    });

    // TIME PERIOD
    $("#time-period-title").text(DAYS_BEFORE);
    $("#date_1").text(get_days_before(null));
    $("#date_2").text(get_days_before(DAYS_BEFORE));

});



function get_days_before(time) {

    let today = new Date();

    if (time != null) {
        today.setDate(today.getDate() - time);
    }
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
}

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