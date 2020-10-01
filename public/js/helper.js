const addBtn = "#addBtn";
const table = "#state_county_table";
const stateInput = "#stateInput";
const countyInput = "#countyInput";

let state_county_arr = [];

$(document).ready(function() {

    $(addBtn).click(function() {

        let table_row = `<tr> <td> XXX </td> <td> YYY </td> <td><i style="color: red;" class="fa fa-trash" aria-hidden="true"></i> </td> </tr> `;

        let state = $(stateInput).val();
        let county = $(countyInput).val();

        /* TODO: input validation
            Verify is state and county is not empty.  to notify the user use this functon -> alert("Message")
        */

        let isDuplicate = state_county_arr.some((element) => element == state + county);

        console.log(isDuplicate);

        // dont add it if the state and county already exits
        if (isDuplicate) return;

        state_county_arr.push(state + county);
        table_row = table_row.replace("XXX", state);
        table_row = table_row.replace("YYY", county);

        // $('#state_county_table > tbody:last-child').append('<tr>One</tr><tr>Two</tr>');
        $('#state_county_table > tbody').last().after(table_row);
        console.log("DONE");
    });

});


/* TODO: for the date in the box 
      ************* REMEMBER TO SEARCH FOR JQUERY ****************

    1. Create a new id for the box - text is prefered
    2. do the logic to get the today's date, and X days laters
    3. update the text using the id you got

    NOTES:
        class --> .
        id --> #
*/