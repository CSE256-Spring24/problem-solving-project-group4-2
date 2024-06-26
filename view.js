// ---- Define your dialogs  and panels here ----
// $('#sidepanel').append('<h2>View the Detailed Permissions for a File/Folder for a User')
// var permission_panel = define_new_effective_permissions('permission_panel', add_info_col=true)
// $('#sidepanel').append(permission_panel)

// var user_selector = define_new_user_select_field('user_selector', 'User Selector', function(selected_user) {
//     $('#permission_panel').attr('username', selected_user)
//     $('#permission_panel').attr('filepath', '/C/presentation_documents/important_file.txt') 
//  })
// $('#sidepanel').append(user_selector)

// var blank_dialog = define_new_dialog('blank_dialog', 'Blank Dialog')
// $('.perm_info').click(function(){
//     blank_dialog.dialog('open')
//     console.log($('#permission_panel').attr('filepath'))
//     console.log($('#permission_panel').attr('username'))
//     console.log($($(this)).attr('permission_name'))

//     filepath_obj = path_to_file[$('#permission_panel').attr('filepath')]
//     user_obj = all_users[$('#permission_panel').attr('username')]

//     var explanation = get_explanation_text(allow_user_action(filepath_obj, user_obj, $(this).attr('permission_name')))
//     blank_dialog.text(explanation)
// })

$(document).ready(function() {
    var popup = "<ul><li>Editing permissions for a folder changes the permissions for everything in that folder</li><li>If Permissions for a user are greyed out, click deny to override the permission or try changing permissions for the parent folder</li><li><b>Close this box and click the orange arrow in the bottom right of the screen to see your task!</b></li></ul>";
    let popup_dialog = define_new_dialog('popup_dialog', 'Before You Start!');
    popup_dialog.append(popup).dialog('open')
})

var permission_dialog = define_new_dialog('permission-help', 'Permissions Help')
$('.perm_info').click(function(){
    blank_dialog.dialog('open')
    // console.log($('#permission_panel').attr('filepath'))
    // console.log($('#permission_panel').attr('username'))
    // console.log($($(this)).attr('permission_name'))
    filepath_obj = path_to_file[$('#permission_panel').attr('filepath')]
    user_obj = all_users[$('#permission_panel').attr('username')]

    //var explanation = get_explanation_text(allow_user_action(filepath_obj, user_obj, $(this).attr('permission_name')))
    permission_dialog.text("Hello")
})

function get_file_path(file_obj, file_paths = []) {
    var file_path = get_full_path(file_obj)
    file_paths.push( file_path )  

    if( file_path in parent_to_children) {
        for(child_file of parent_to_children[file_path]) {
            get_file_path(child_file, file_paths)
        }
    }

    return file_paths
}

for(let root_file of root_files) {
    var file_paths = get_file_path(root_file)  
    console.log(file_paths)
}


// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon">  Edit Permissions</span> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon">  Edit Permissions</span> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 