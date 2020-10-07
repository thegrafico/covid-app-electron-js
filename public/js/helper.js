const addBtn = "#addBtn";
const table = "#state_county_table";
const stateInput = "#stateInput";
const countyInput = "#countyInput";

let DAYS_BEFORE = 21;
let state_county = [];
let temp = {};
let INDEX = 0;
$(document).ready(function() {

    $(addBtn).click(function() {

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


        // $('#state_county_table > tbody:last-child').append('<tr>One</tr><tr>Two</tr>');
        $('#state_county_table > tbody').last().after(table_row);
        temp = {};
        // console.log("INDEX: ", INDEX);
        // console.log(state_county);
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