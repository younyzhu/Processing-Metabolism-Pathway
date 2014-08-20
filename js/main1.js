/**
 * Created by Yongnanzhu on 5/12/2014.
 */

//Global variable for counting the bubble number
var Data = {};
Data.compartments = [];
Data.arrows = [];
Data.inhibitions = [];
Data.activations = [];
var graphs =[];
var springy = null;
$(document).ready(function () {
    var results = [];
    $.ajax({
        type: "GET",
        url: "Metabolism.xml",
        dataType: "text",
        success: function (xml) {
            if (typeof xml === 'string' || xml instanceof String) {
                var $doc = $.parseXML(xml);
                $($doc).find('Pathways').children('Pathway').each(function(){         //homo sapiens =====>   Metabolism[**Level1**]
                    //results.push($(this).attr('displayName'));
                    var parentName = $(this).attr('displayName');
                    parentName = parentName.replace( /[()<>:,&.'"\/\\|?*]+/g, '' );  //& < > " ' xml special characters

                    $(this).children('Pathway').each(function(){                 //homo sapiens =====>   Metabolism ====>  [**Level2**]
                        var object={};
                        object.parentName = parentName;
                        var objName = $(this).attr('displayName');
                        objName = objName.replace( /[()<>:,&.'"\/\\|?*]+/g, '' );
                        object.name = objName;
                        object.dbId = $(this).attr('dbId');

                        var children = [];
                        $(this).children('Pathway').each(function(){               //homo sapiens =====>   Metabolism ====>  [**Level3**]
                            var child = {};
                            child.dbId = $(this).attr('dbId');
                            var childName = $(this).attr('displayName');
                            childName = childName.replace( /[()<>:,&.'"\/\\|?*]+/g, '' );
                            child.name = childName;
                            children.push(child);
                        });
                        object.children = children;
                        results.push(object);
                    });
                });
                if(results.length !== 0)
                {
                    var file = new File(results);
                }
            }

        }
    });
});