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
                $($doc).find('Pathways').children('Pathway').each(function(){//homo sapiens =====>   Metabolism[**Level1**]
                    $(this).children('Pathway').each(function() {            //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**]
                        $(this).children('Pathway').each(function () {            //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**]
                            $(this).children('Pathway').each(function () {            //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**] ====>  [**Level3**]
                                $(this).children('Pathway').each(function () {            //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**] ====>  [**Level3**] ====>  [**Level4**]
                                    $(this).children('Pathway').each(function () {            //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**] ====>  [**Level3**] ====>  [**Level4**] ====>  [**Level5**]
                                        var parentName = $(this).attr('displayName');
                                        parentName = parentName.replace(/[()<>:,&.'"\/\\|?*]+/g, '');  //& < > " ' xml special characters
                                        $(this).children('Pathway').each(function () {       //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**] ====>  [**Level3**] ====>  [**Level4**] ====>  [**Level5**]====>  [**Level6**]
                                            var object = {};
                                            object.parentName = parentName;
                                            var objName = $(this).attr('displayName');
                                            objName = objName.replace(/[()<>:,&.'"\/\\|?*]+/g, '');
                                            object.name = objName;
                                            object.dbId = $(this).attr('dbId');
                                            var children = [];
                                            $(this).children('Pathway').each(function () {    //homo sapiens =====>   Metabolism[**Level1**] ====>  [**Level2**] ====>  [**Level3**] ====>  [**Level4**] ====>  [**Level5**] ====>  [**Level6**]====>  [**Level7**]
                                                var child = {};
                                                child.dbId = $(this).attr('dbId');
                                                var childName = $(this).attr('displayName');
                                                childName = childName.replace(/[()<>:,&.'"\/\\|?*]+/g, '');
                                                child.name = childName;
                                                children.push(child);
                                            });
                                            object.children = children;
                                            results.push(object);
                                        });
                                    });
                                });
                            });
                        });
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