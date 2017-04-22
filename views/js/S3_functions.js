$(document).ready(function() {
  //prolly dont need globals, but were good for 1.0
  var json = {};
  var statColumns = {};
  var statTypes = ['Hours', 'Kills', 'Deaths'];
  $.ajax({
    url: "/api/web/fetch",
    type: "POST",
    dataType: "json",
    data: {},
    success: function(data) {
      if (data === false) {
        console.log('ERROR: Server could not return a valid database object.');
        return;
      }

      json = data;

      refreshColumnMappings(data);
      updateServersTable(data); //populate server list / actions

      $('#loading-icon').bind('showTree', function() {
        $(this).css({'padding-top':'45px','padding-bottom':'35px'});
        $(this).show();
      });
      $('#loading-icon').bind('treeCreated', function() {
        $(this).hide();
        $(this).css({'padding-top':'0px','padding-bottom':'0px'});
      });

      $('.tree-view').on('click', 'button', function() {
        $('#loading-icon').trigger('showTree');
        $('.tree-view button').hide();
        setTimeout(function() { showTree() }, 0);
      });
      $('.table-links').on('click', 'a', function(e) { tableToHTML(tabulate($(this).attr('data-id'), $(this).text())) });

    }, //end success
    error: function(err) { console.log(err) }
  }); //end ajax call

  //------------------------

  //get the nested ids to look in depending on what the user wants to see
  function getFirstLevelIndices(stat, cols) {
    switch (stat) {
      case statTypes[0]:
        return ['times'];
        break;
      case statTypes[1]:
        return ['kills','friendlyKills','PvP'];
        break;
      case statTypes[2]:
        return ['losses', 'PvP'];
        break;
      default:
        return false;
    }
  }

  //------------------------

  function showTree() {
    $('#json-tree').removeAttr('style');
    $('#json-tree').jsonViewer(json, {collapsed: true}); //call tree view on the json
    $('#loading-icon').trigger('treeCreated');
  }

  //------------------------

  //make the header that lets you choose which table to render
  //choose server, choose stat to view
  function updateServersTable(data) {
    var servers = $('#servers');
    servers.append(
      $('<div></div>').addClass('row').addClass('server-list-row-header')
        .append(
          $('<div></div>').text('Server List').addClass('col-md-8 col-sm-8 col-xs-8')
        ).append(
          $('<div></div>').text('Actions').addClass('col-md-4 col-sm-4 col-xs-4')
        )
    );
    for (var i in data) { //for each server
      if (i !== 'whitelistedAircraft' && i !== 'whitelistedKillObjects') {
        servers.append(
          $('<div></div>').addClass('row').addClass('server-list-row').append(
            $('<div></div>').text(data[i]['name']).addClass('col-md-8 col-sm-8 col-xs-8') //add the row for server
          ).append( //add actions
            $('<div></div>').addClass('table-links').addClass('col-md-4 col-sm-4 col-xs-4')
              .append($('<a></a>').attr({'data-id':i}).text(statTypes[0]))
              .append($('<span></span>').text(' | '))
              .append($('<a></a>').attr({'data-id':i}).text(statTypes[1]))
              .append($('<span></span>').text(' | '))
              .append($('<a></a>').attr({'data-id':i}).text(statTypes[2]))
          )
        );
      }
    }
    //console.log('updated servers table');
  }

  //------------------------

  //returns specific formatted values according to what data its trying to table
  function floatingPtHours(val) {
    return (Math.round((100*val/3600))/100); //floating pt hours
  }


  //------------------------

  function makeDataRows(table, serverId, stat, columns) {
    //loop through player nodes
      //loop through player's stats likes times
        //determine if node should be used for something
          //if so then use it
          //differnt
          //ways
    var firstLevelIndices = getFirstLevelIndices(stat);
    for (var pid in json[serverId]['stats']) { //loop through player nodes
      for (var fli in json[serverId]['stats'][pid]) { //loop through stats for player
        if (firstLevelIndices.indexOf(fli) != -1) { //we want something from here


          //here comes the messy part...
          if ((fli == 'times' && stat == statTypes[0]) || (fli == 'kills' && stat == statTypes[1])) {
            //console.log('times'); //verbatim mappings, key > key
            for (var index in json[serverId]['stats'][pid][fli]) { //table[-1] will have data...
              var nameKey = columns[stat].indexOf(index);
              if (nameKey != -1) {
                if (index == 'Ground Units') {
                  var nonInfantry = 0;
                  for (var type in json[serverId]['stats'][pid][fli][index]) {
                    if (type != 'total' && type != 'Infantry') {
                      nonInfantry += parseInt(json[serverId]['stats'][pid][fli][index][type]);
                    }
                  }
                  // console.log('---');
                  // console.log(columns[stat].indexOf('Infantry'));
                  // console.log(columns[stat].indexOf('Non-Infantry'));
                  // console.log(columns[stat].indexOf('Ground Units'));
                  table[pid][columns[stat].indexOf('Infantry')] = json[serverId]['stats'][pid][fli][index]['Infantry']; //set infantry
                  table[pid][columns[stat].indexOf('Non-Infantry')] = nonInfantry; //set nonInfantry
                  table[pid][columns[stat].indexOf('Ground Units')] = json[serverId]['stats'][pid][fli][index]['total']; //set total
                  //console.log(table[pid][columns[stat].indexOf('Infantry')] + table[pid][columns[stat].indexOf('Non-Infantry')] + table[pid][columns[stat].indexOf('Ground Units')]);
                } else if (fli == 'times') { table[pid][nameKey] = floatingPtHours(json[serverId]['stats'][pid][fli][index]['total']) }
                else { table[pid][nameKey] = json[serverId]['stats'][pid][fli][index]['total'] }
              }
            }
          } else if (fli == 'friendlyKills' && stat == statTypes[1]) { //Friendly Kills count nodes;
            if (json[serverId]['stats'][pid][fli]) { table[pid][columns[stat].indexOf('Friendly Kills')] = Object.keys(json[serverId]['stats'][pid][fli]).length }
            else { table[pid][columns[stat].indexOf('Friendly Kills')] = 0 }
          } else if (fli == 'losses' && stat == statTypes[2]) { //pilotDeath > Deaths, crash > Crashes, eject > Ejections
            table[pid][columns[stat].indexOf('Deaths')] = json[serverId]['stats'][pid][fli]['pilotDeath'];
            table[pid][columns[stat].indexOf('Crashes')] = json[serverId]['stats'][pid][fli]['crash'];
            table[pid][columns[stat].indexOf('Ejections')] = json[serverId]['stats'][pid][fli]['eject'];
          } else if (fli == 'PvP' && stat == statTypes[1]) { //kills > PvP Kills
            table[pid][columns[stat].indexOf('PvP Kills')] = json[serverId]['stats'][pid][fli]['kills'];
          } else if (fli == 'PvP' && stat == statTypes[2]) { //losses > PvP Deaths
            table[pid][columns[stat].indexOf('PvP Deaths')] = json[serverId]['stats'][pid][fli]['losses'];
          }


        }
      }

    }
    //console.log(table);
    return table;
  }

  //------------------------

  function tabulate(serverId, stat) {
    //console.log(statColumns);
    var table = [];
    table[0] = statColumns[stat];
    for (var player in json[serverId]['stats']) {
      table.push([]);
      for (var column in statColumns[stat]) { //go ahead and set name column now
        if (column == 0) { table[parseInt(player)][column] = json[serverId]['stats'][player]['name'] }
        else { table[parseInt(player)][column] = 0 } //if not name, set 0
      }
    }
    return makeDataRows(table, serverId, stat, statColumns);
  }

  //------------------------

  function createTableHeader(arr) {
    var thead = $('<thead></thead>');
    var tr = $('<tr></tr>');
    for (var i in arr) { tr.append($('<th></th>').text(arr[i])) }
    $('.datatable').append(thead.append(tr));
  }

  //------------------------

  function createTableBody(arr) {
    var tbody = $('<tbody></tbody>');
    for (var pid in arr) {
      if (pid !== '0') { //dont add thead data
        var htmlRow = $('<tr></tr>');
        for (var col in arr[pid]) { htmlRow.append($('<td></td>').text(arr[pid][col])) }
        tbody.append(htmlRow);
      }
    }
    $('.datatable').append(tbody);
  }

  //-------------------------

  function tableToHTML(arr) {
    if ( $.fn.DataTable.isDataTable('#datatable') ) {
      $('#datatable').DataTable().destroy();
      $('#datatable head').empty();
      $('#datatable tbody').empty();
    }
    $('#dt-container').html('');
    $('#dt-container').append($('<table></table').attr({'class':'table datatable','id':'datatable'}));
    createTableHeader(arr[0]);
    createTableBody(arr);
    $('#datatable').DataTable();
  }

  function refreshColumnMappings(json) {
    //make  hours columns
    var hoursCols = [];
    Array.prototype.push.apply(hoursCols, json['whitelistedAircraft']);
    hoursCols.unshift('Pilot');

    //make kills columns
    var killsCols = [];
    Array.prototype.push.apply(killsCols, json['whitelistedKillObjects']);
    killsCols.unshift('Friendly Kills');
    killsCols.unshift('PvP Kills');
    if (killsCols.indexOf('Ground Units') > -1) { //if theyre sending us ground units, make spots for both
      killsCols.unshift('Non-Infantry');
      killsCols.unshift('Infantry');
    }
    killsCols.unshift('Pilot');

    //deaths columns are completely placid, there is no whitelist or variation needed
    //but make them (again?) anyway since we are being all official
    var deathsCols = [ "Pilot", "Deaths", "Crashes", "Ejections", "PvP Deaths" ];

    //set the global stat columns
    statColumns = {
      //hours list (send it whitelisted aircraft names)
      'Hours':  hoursCols,
      //kills list
      'Kills': killsCols,
      //deaths list
      'Deaths': deathsCols
    };

  }
});
