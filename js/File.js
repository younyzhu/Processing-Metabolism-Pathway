/**
 * Created by Yongnan on 7/23/2014.
 */
var processedIdex = 0;  //index  7  9 17
function File(str) {
    var _this = this;

    this.reactions = [];
    this.flag = false;
    var startTime = new Date();
    function animate() {
        requestAnimationFrame(animate);
        _this.processData(str[processedIdex].dbId);

        if (springy&&Data.compartments.length>0)
        {
            if (springy.getStopStatus() && processedIdex !== str.length && _this.flag === true) {
                //_this.saveJson();
                springy.stopLayout();
                console.log(processedIdex);
                _this.saveXML(str, processedIdex);

                springy = null;
                graphs.length = 0;
                Data = {};
                Data.compartments = [];
                Data.arrows = [];
                Data.inhibitions = [];
                Data.activations = [];
                _this.reactions.length = 0;
                _this.flag = false;
                processedIdex++;
            }
        }
    }
    animate();

}
File.prototype = {
//7/30/2014 meeting with Su Liang, all the elements in convertedEntity draw with physical entity (It is wrong)  Finally, I change back.
    processData: function (fileNum) {
        if (!this.flag) {
            console.log(fileNum);
            this.processComplex(fileNum);
            this.processProtein(fileNum);
            this.processSmallEntity(fileNum);
            this.processConvertedEntity(fileNum);
            this.processArrowAndReaction(fileNum);
            this.processReactionControl(fileNum);
            this.removeUnwantedData();
            if(Data.compartments.length>0)    //
            {
                this.setCompartIdforElement(); //create node for force direct
                this.setCompartmentRelationship();//Add link for force direct
                this.addNodeLink();
                this.arrangeGraphBox();
            }
            if(Data.compartments.length===0)    //
            {
                springy = null;
                graphs.length = 0;
                Data = {};
                Data.compartments = [];
                Data.arrows = [];
                Data.inhibitions = [];
                Data.activations = [];
                this.reactions.length = 0;
                this.flag = false;
                processedIdex++;
            }
        }
    },
    processComplex: function (fileNum) {
        //101430_6complex.txt format
        //Complex(id) |  name  |  compartmentName |reactome_databaseId |The_Other_Node_include_in_Complex
        //Complex1 | Noradrenalin loaded synaptic vesicle |clathrin-coated endocytic vesicle |Reactome DB_ID: 374911| Protein3
        var fileName = fileNum + "_6complex.txt";
        var _this = this;
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");
                    for (var i = 0; i < lines.length; ++i) {
                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");
                            if (array[0].replace(/\d+/g, '') !== "Complex") {
                                continue;
                            }
                            for (var k = 0; k < Data.compartments.length; ++k) {
                                if (Data.compartments[k].name === array[2]) {
                                    break;
                                }
                            }
                            if (k >= Data.compartments.length) {
                                var compartment = {};
                                compartment.x = 0;
                                compartment.y = 0;
                                compartment.w = 0;
                                compartment.h = 0;
                                compartment.complexs = [];
                                compartment.proteins = [];
                                compartment.entitys = [];
                                compartment.molecules = [];
                                compartment.rnas = [];
                                compartment.dnas = [];
                                compartment.associations = [];
                                compartment.dissociations = [];
                                compartment.transitions = [];
                                compartment.name = array[2];

                                for (var j = 0; j < compartment.complexs.length; ++j) {
                                    if (compartment.complexs[j].id === parseInt(array[0].match(/\d+/g))) {
                                        break;
                                    }
                                }
                                if (j >= compartment.complexs.length) {
                                    var complex = {};
                                    complex.id = parseInt(array[0].match(/\d+/g));
                                    complex.name = array[1];
                                    complex.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                    complex.type = "C";
                                    complex.flag = false;
                                    complex.w = 15;
                                    complex.h = 6;
                                    complex.children = {};
                                    complex.children.complexs = [];
                                    complex.children.dnas = [];
                                    complex.children.rnas = [];
                                    complex.children.proteins = [];
                                    complex.children.molecules = [];
                                    complex.children.associations = [];
                                    complex.children.dissociations = [];
                                    complex.children.transitions = [];
                                    complex.children.entitys = [];
                                    var Id = parseInt(array[4].match(/\d+/g));
                                    var type = array[4].replace(/\d+/g, '');
                                    _this.addChild(complex, type, Id);
                                    compartment.complexs.push(complex);
                                }
                                else {
                                    var currentComplex = compartment.complexs[j];
                                    var Id = parseInt(array[4].match(/\d+/g));
                                    var type = array[4].replace(/\d+/g, '');
                                    _this.addChild(currentComplex, type, Id);
                                }
                                Data.compartments.push(compartment);
                            }
                            else {
                                var currentCompartment = Data.compartments[k];
                                for (var j = 0; j < currentCompartment.complexs.length; ++j) {
                                    if (currentCompartment.complexs[j].name === array[1]) {
                                        break;
                                    }
                                }
                                if (j >= currentCompartment.complexs.length) {
                                    var complex = {};
                                    complex.id = parseInt(array[0].match(/\d+/g));
                                    complex.name = array[1];
                                    complex.type = "C";
                                    complex.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                    complex.flag = false;
                                    complex.w = 15;
                                    complex.h = 6;
                                    complex.children = {};
                                    complex.children.complexs = [];
                                    complex.children.dnas = [];
                                    complex.children.rnas = [];
                                    complex.children.proteins = [];
                                    complex.children.molecules = [];
                                    complex.children.associations = [];
                                    complex.children.dissociations = [];
                                    complex.children.transitions = [];
                                    complex.children.entitys = [];
                                    var Id = parseInt(array[4].match(/\d+/g));
                                    var type = array[4].replace(/\d+/g, '');
                                    _this.addChild(complex, type, Id);
                                    currentCompartment.complexs.push(complex);
                                }
                                else {
                                    var currentComplex = currentCompartment.complexs[j];
                                    var Id = parseInt(array[4].match(/\d+/g));
                                    var type = array[4].replace(/\d+/g, '');
                                    _this.addChild(currentComplex, type, Id);
                                }
                            }
                        }
                    }
                }
            }
        });
    },
    addChild: function (object, type, Id) {
        switch (type) {
            case "Protein":  //Arrow (Black)
                var protein = {};
                protein.id = Id;
                protein.w = 40;
                protein.h = 15;
                protein.type = "P";
                protein.flag = false;
                for (var i = 0; i < object.children.proteins.length; ++i) {
                    if (object.children.proteins[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.proteins.length) {
                    object.children.proteins.push(protein);
                }
                break;
            case "Rna":
                var rna = {};
                rna.id = Id;
                rna.type = "Rna";
                rna.flag = false;
                rna.w = 40;
                rna.h = 15;
                for (var i = 0; i < object.children.rnas.length; ++i) {
                    if (object.children.rnas[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.rnas.length) {
                    object.children.rnas.push(rna);
                }
                break;

            case "Dna":
                var dna = {};
                dna.id = Id;
                dna.type = "D";
                dna.flag = false;
                dna.w = 40;
                dna.h = 15;
                for (var i = 0; i < object.children.dnas.length; ++i) {
                    if (object.children.dnas[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.dnas.length) {
                    object.children.dnas.push(dna);
                }
                break;

            case "SmallMolecule":
                var molecule = {};
                molecule.duplicates = [];
                molecule.id = Id;
                molecule.type = "S";
                molecule.flag = false;
                molecule.w = 40;
                molecule.h = 15;
                for (var i = 0; i < object.children.molecules.length; ++i) {
                    if (object.children.molecules[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.molecules.length) {
                    object.children.molecules.push(molecule);
                }
                break;

            case "Complex":
                var complex = {};
                complex.id = Id;
                complex.type = "C";
                complex.flag = false;
                complex.w = 15;    // Change to fixed size 7/14/2014
                complex.h = 6;
                for (var i = 0; i < object.children.complexs.length; ++i) {
                    if (object.children.complexs[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.complexs.length) {
                    object.children.complexs.push(complex);
                }
                break;

            case "PhysicalEntity":
                var entity = {};
                entity.type = "E";
                entity.id = Id;
                entity.flag = false;
                entity.w = 30;
                entity.h = 13;
                for (var i = 0; i < object.children.entitys.length; ++i) {
                    if (object.children.entitys[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.children.entitys.length) {
                    object.children.entitys.push(entity);
                }
                break;
        }
    },
    processProtein: function (fileNum) {
        //101430_7protein.txt format
        //Protein(id) |  name  |  UniProtId |reactome_databaseId |compartment name
        //Protein1 | SLC18A2 |UniProt:Q05940 SLC18A2 |Reactome DB_ID: 372544| clathrin-sculpted monoamine transport vesicle membrane
        var fileName = fileNum + "_7protein.txt";
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");
                    for (var i = 0; i < lines.length; ++i) {
                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");
                            if (array[0].replace(/\d+/g, '') !== "Protein") {
                                continue;
                            }
                            for (var k = 0; k < Data.compartments.length; ++k) {
                                if (Data.compartments[k].name === array[4]) {
                                    break;
                                }
                            }
                            if (k >= Data.compartments.length) {
                                var compartment = {};
                                compartment.x = 0;
                                compartment.y = 0;
                                compartment.w = 0;
                                compartment.h = 0;
                                compartment.complexs = [];
                                compartment.dnas = [];
                                compartment.rnas = [];
                                compartment.proteins = [];
                                compartment.molecules = [];
                                compartment.associations = [];
                                compartment.dissociations = [];
                                compartment.transitions = [];
                                compartment.entitys = [];
                                compartment.name = array[4];

                                for (var j = 0; j < compartment.proteins.length; ++j) {
                                    if (compartment.proteins[j].id === parseInt(array[0].match(/\d+/g))) {
                                        break;
                                    }
                                }
                                if (j >= compartment.proteins.length) {
                                    var protein = {};
                                    protein.type = "P";
                                    protein.flag = false;
                                    protein.w = 40;
                                    protein.h = 15;
                                    protein.id = parseInt(array[0].match(/\d+/g));
                                    protein.name = array[1];
                                    protein.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                    compartment.proteins.push(protein);
                                }
                                Data.compartments.push(compartment);
                            }
                            else {
                                var currentCompartment = Data.compartments[k];
                                for (var j = 0; j < currentCompartment.proteins.length; ++j) {
                                    if (currentCompartment.proteins[j].id === parseInt(array[0].match(/\d+/g))) {
                                        break;
                                    }
                                }
                                if (j >= currentCompartment.proteins.length) {
                                    var protein = {};
                                    protein.type = "P";
                                    protein.flag = false;
                                    protein.w = 40;
                                    protein.h = 15;
                                    protein.id = parseInt(array[0].match(/\d+/g));
                                    protein.name = array[1];
                                    protein.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                    currentCompartment.proteins.push(protein);
                                }
                            }
                        }
                    }
                }
            }
        });
    },
    processSmallEntity: function (fileNum) {
        //101430_7smallEntity.txt format
        //Rna and   SmallMolecule
        //Protein(id) |  name  |  UniProtId |reactome_databaseId |compartment name
        //Protein1 | SLC18A2 |UniProt:Q05940 SLC18A2 |Reactome DB_ID: 372544| clathrin-sculpted monoamine transport vesicle membrane
        var fileName = fileNum + "_9smallEntity.txt";
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");
                    for (var i = 0; i < lines.length; ++i) {
                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");
                            if (array[0].replace(/\d+/g, '') === "SmallMolecule" || array[0].replace(/\d+/g, '') === "Dna" || array[0].replace(/\d+/g, '') === "Rna") {
                                for (var k = 0; k < Data.compartments.length; ++k) {
                                    if (Data.compartments[k].name === array[4]) {
                                        break;
                                    }
                                }
                                if (k >= Data.compartments.length) {
                                    var compartment = {};
                                    compartment.x = 0;
                                    compartment.y = 0;
                                    compartment.w = 0;
                                    compartment.h = 0;
                                    compartment.complexs = [];
                                    compartment.dnas = [];
                                    compartment.rnas = [];
                                    compartment.proteins = [];
                                    compartment.molecules = [];
                                    compartment.associations = [];
                                    compartment.dissociations = [];
                                    compartment.transitions = [];
                                    compartment.entitys = [];
                                    compartment.name = array[4];
                                    var type = array[0].replace(/\d+/g, '');
                                    if (type === "SmallMolecule") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < compartment.molecules.length; ++j) {
                                            if (compartment.molecules[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= compartment.molecules.length) {
                                            var molecule = {};
                                            molecule.duplicates = [];
                                            molecule.id = parseInt(array[0].match(/\d+/g));
                                            molecule.type = "S";
                                            molecule.w = 40;
                                            molecule.h = 15;
                                            molecule.flag = false;
                                            molecule.name = array[1];
                                            molecule.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            compartment.molecules.push(molecule);
                                        }
                                    }
                                    else if (type === "Dna") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < compartment.dnas.length; ++j) {
                                            if (compartment.dnas[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= compartment.dnas.length) {
                                            var dna = {};
                                            dna.id = parseInt(array[0].match(/\d+/g));
                                            dna.type = "D";
                                            dna.w = 40;
                                            dna.h = 15;
                                            dna.flag = false;
                                            dna.name = array[1];
                                            dna.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            compartment.dnas.push(dna);
                                        }
                                    }
                                    else if (type === "Rna") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < compartment.rnas.length; ++j) {
                                            if (compartment.rnas[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= compartment.rnas.length) {
                                            var rna = {};
                                            rna.id = parseInt(array[0].match(/\d+/g));
                                            rna.type = "Rna";
                                            rna.w = 40;
                                            rna.h = 15;
                                            rna.flag = false;
                                            rna.name = array[1];
                                            rna.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            compartment.rnas.push(rna);
                                        }
                                    }
                                    Data.compartments.push(compartment);
                                }
                                else {
                                    var type = array[0].replace(/\d+/g, '');
                                    var currentCompartment = Data.compartments[k];
                                    if (type === "SmallMolecule") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < currentCompartment.molecules.length; ++j) {
                                            if (currentCompartment.molecules[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= currentCompartment.molecules.length) {
                                            var molecule = {};
                                            molecule.duplicates = [];
                                            molecule.id = parseInt(array[0].match(/\d+/g));
                                            molecule.duplicates.push( molecule.id );
                                            molecule.type = "S";
                                            molecule.flag = false;
                                            molecule.w = 40;
                                            molecule.h = 15;
                                            molecule.name = array[1];
                                            molecule.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            currentCompartment.molecules.push(molecule);
                                        }
                                    }
                                    else if (type === "Dna") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < currentCompartment.dnas.length; ++j) {
                                            if (currentCompartment.dnas[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= currentCompartment.dnas.length) {
                                            var dna = {};
                                            dna.id = parseInt(array[0].match(/\d+/g));
                                            dna.type = "D";
                                            dna.w = 40;
                                            dna.h = 15;
                                            dna.flag = false;
                                            dna.name = array[1];
                                            dna.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            currentCompartment.dnas.push(dna);
                                        }
                                    }
                                    else if (type === "Rna") {
                                        //if (type === "SmallMolecule" || type === "Rna" || type === "Dna") {
                                        for (var j = 0; j < currentCompartment.rnas.length; ++j) {
                                            if (currentCompartment.rnas[j].id === parseInt(array[0].match(/\d+/g))) {
                                                break;
                                            }
                                        }
                                        if (j >= currentCompartment.rnas.length) {
                                            var rna = {};
                                            rna.id = parseInt(array[0].match(/\d+/g));
                                            rna.type = "Rna";
                                            rna.w = 40;
                                            rna.h = 15;
                                            rna.flag = false;
                                            rna.name = array[1];
                                            rna.ReactomeDbId =  parseInt(array[3].match(/\d+/g));
                                            currentCompartment.rnas.push(rna);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    },
    processArrowAndReaction: function (fileNum)      //reaction type
    {
        //(1) bind: association (multi ---> one)
        //(2) dissociation: one ---> multi
        //(3) other transition
        //biochemicalReaction | name | input | output
        var fileName = fileNum + "_4biochemicalReaction.txt";
        var _this = this;
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");
                    var reactions = [];
                    for (var i = 0; i < lines.length; ++i) {

                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");
                            if (array[0].replace(/\d+/g, '') !== "BiochemicalReaction" ) {   //Here we just process BiochemicalReaction
                                continue;
                            }
                            for (var j = 0; j < reactions.length; ++j) {
                                if (reactions[j].id === parseInt(array[0].match(/\d+/g))) {
                                    break;
                                }
                            }
                            if (j >= reactions.length) {
                                var reaction = {};
                                reaction.id = parseInt(array[0].match(/\d+/g));
                                reaction.name = array[1];
                                reaction.input = [];
                                reaction.output = [];
                                reaction.input.push(array[2]);
                                reaction.output.push(array[3]);
                                reactions.push(reaction);
                            }
                            else {
                                var reaction = reactions[j];
                                for (var k = 0; k < reaction.input.length; ++k) {
                                    if (reaction.input[k] === array[2]) {
                                        break;
                                    }
                                }
                                if (k >= reaction.input.length) {
                                    reaction.input.push(array[2]);
                                    for (var t = 0; t < reaction.output.length; ++t) {
                                        if (reaction.output[t] === array[3]) {
                                            break;
                                        }
                                    }
                                    if (t >= reaction.output.length) {
                                        reaction.output.push(array[3]);
                                    }
                                }
                                else {
                                    for (var t = 0; t < reaction.output.length; ++t) {
                                        if (reaction.output[t] === array[3]) {
                                            break;
                                        }
                                    }
                                    if (t >= reaction.output.length) {
                                        reaction.output.push(array[3]);
                                    }
                                }
                            }
                        }
                    }
                    for (var i = 0; i < reactions.length; ++i) {
                        _this.addArrowReaction(reactions[i]);
                    }
                }
            }
        });
    },
    getObjectByTypeIndex: function (type, id) {
        switch (type) {
            case "Protein":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].proteins.length; ++j) {
                        if (Data.compartments[i].proteins[j].id === id) {
                            return Data.compartments[i].proteins[j];
                        }
                    }
                }
                return null;

            case "Rna":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].rnas.length; ++j) {
                        if (Data.compartments[i].rnas[j].id === id) {
                            return Data.compartments[i].rnas[j];
                        }
                    }
                }
                return null;

            case "Dna":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].dnas.length; ++j) {
                        if (Data.compartments[i].dnas[j].id === id) {
                            return Data.compartments[i].dnas[j];
                        }
                    }
                }
                return null;

            case "SmallMolecule":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].molecules.length; ++j) {
                        if (Data.compartments[i].molecules[j].id === id && Data.compartments[i].molecules[j].flag=== false) {
                            return Data.compartments[i].molecules[j];
                        }
                        else if (Data.compartments[i].molecules[j].id === id && Data.compartments[i].molecules[j].flag=== true) {
                            var numberOfSmallMolecule = 1;
                            for(var k=0;k<Data.compartments.length; ++k)
                            {
                                numberOfSmallMolecule += Data.compartments[k].molecules.length;
                            }
                            Data.compartments[i].molecules[j].duplicates.push(numberOfSmallMolecule);
                            var molecule = {};
                            molecule.duplicates = Data.compartments[i].molecules[j].duplicates;
                            molecule.ReactomeDbId = Data.compartments[i].molecules[j].ReactomeDbId;
                            molecule.id = numberOfSmallMolecule;
                            molecule.type = "S";
                            molecule.w = 40;
                            molecule.h = 15;
                            molecule.flag = false;
                            molecule.name = Data.compartments[i].molecules[j].name;
                            Data.compartments[i].molecules.push(molecule);
                            id = numberOfSmallMolecule;
                            return molecule;
                        }
                    }
                }
                return null;

            case "Complex":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].complexs.length; ++j) {
                        if (Data.compartments[i].complexs[j].id === id) {
                            return Data.compartments[i].complexs[j];
                        }
                    }
                }
                return null;

            case "PhysicalEntity":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].entitys.length; ++j) {
                        if (Data.compartments[i].entitys[j].id === id) {
                            return Data.compartments[i].entitys[j];
                        }
                    }
                }
                return null;

            case "T":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].transitions.length; ++j) {
                        if (Data.compartments[i].transitions[j].id === id) {
                            return Data.compartments[i].transitions[j];
                        }
                    }
                }
                return null;

            case "B":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].associations.length; ++j) {
                        if (Data.compartments[i].associations[j].id === id) {
                            return Data.compartments[i].associations[j];
                        }
                    }
                }
                return null;

            case "K":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].dissociations.length; ++j) {
                        if (Data.compartments[i].dissociations[j].id === id) {
                            return Data.compartments[i].dissociations[j];
                        }
                    }
                }
                return null;
        }
    },
    addArrowReaction: function (reaction) {
        if (reaction.input.length > 1 && reaction.output.length === 1)   //bind association
        {
            var flag = true;
            var association = {};
            for (var i = 0; i < reaction.input.length; ++i) {
                var Id = parseInt(reaction.input[i].match(/\d+/g));
                var type = reaction.input[i].replace(/\d+/g, '');

                if (flag)
                {
                    var compartment = this.getCompartmentByName(type, Id);
                    if (compartment) {
                        association.name = reaction.name;
                        association.id = reaction.id;
                        association.type = "B";
                        association.w = 6;
                        association.h = 6;
                        association.flag = false;
                        this.reactions.push(association);
                        compartment.associations.push(association);
                        flag = false;
                    }
                }
                if(!compartment)
                    return;
                for (var j = 0; j < Data.arrows.length; ++j) {
                    if (Id === Data.arrows[j].begin.id && type === Data.arrows[j].begin.type && reaction.id === Data.arrows[j].end.id) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = this.getObjectByTypeIndex(type, Id);
                    arrow.end = association;
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;
                    Data.arrows.push(arrow);
                }
            }
            for (var i = 0; i < reaction.output.length; ++i) {
                var Id = parseInt(reaction.output[i].match(/\d+/g));
                var type = reaction.output[i].replace(/\d+/g, '');
                for (var j = 0; j < Data.arrows.length; ++j) {
                    if (reaction.id === Data.arrows[j].end.id&& type === Data.arrows[j].end.type && Id === Data.arrows[j].begin.id ) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = association;
                    arrow.end = this.getObjectByTypeIndex(type, Id);
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;
                    Data.arrows.push(arrow);
                }
            }
        }
        else if (reaction.input.length === 1 && reaction.output.length > 1)   //dissociation
        {
            var flag = true;
            var dissociation = {};
            for (var i = 0; i < reaction.input.length; ++i) {
                var Id = parseInt(reaction.input[i].match(/\d+/g));
                var type = reaction.input[i].replace(/\d+/g, '');
                if (flag) {
                    var compartment = this.getCompartmentByName(type, Id);
                    if (compartment) {
                        dissociation.name = reaction.name;
                        dissociation.id = reaction.id;
                        dissociation.type = "K";
                        dissociation.w = 6;
                        dissociation.h = 6;
                        dissociation.flag = false;
                        this.reactions.push(dissociation);
                        compartment.dissociations.push(dissociation);
                        flag = false;
                    }
                }
                if(!compartment)
                    return;
                for (var j = 0; j < Data.arrows.length; ++j) {
                    //reaction.id === Data.arrows[j].begin.id&& type === Data.arrows[j].begin.type && Id === Data.arrows[j].end.id
                    if (Id === Data.arrows[j].begin.id && type === Data.arrows[j].begin.type && reaction.id === Data.arrows[j].end.id) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = this.getObjectByTypeIndex(type, Id);
                    arrow.end = dissociation;
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;
                    Data.arrows.push(arrow);
                }
            }
            for (var i = 0; i < reaction.output.length; ++i) {
                var Id = parseInt(reaction.output[i].match(/\d+/g));
                var type = reaction.output[i].replace(/\d+/g, '');
                for (var j = 0; j < Data.arrows.length; ++j) {
                    if (reaction.id === Data.arrows[j].end.id && type === Data.arrows[j].end.type && Id === Data.arrows[j].begin.id) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = dissociation;
                    arrow.end = this.getObjectByTypeIndex(type, Id);
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;
                    Data.arrows.push(arrow);
                }
            }
        }
        else {
            var flag = true;
            var transition = {};
            for (var i = 0; i < reaction.input.length; ++i) {
                var Id = parseInt(reaction.input[i].match(/\d+/g));
                var type = reaction.input[i].replace(/\d+/g, '');

                if (flag) {
                    var compartment = this.getCompartmentByName(type, Id);
                    if (compartment) {
                        transition.name = reaction.name;
                        transition.id = reaction.id;
                        transition.type = "T";
                        transition.w = 6;
                        transition.h = 6;
                        transition.flag = false;
                        this.reactions.push(transition);
                        compartment.transitions.push(transition);
                        flag = false;
                    }
                }
                if(!compartment)
                    return;
                for (var j = 0; j < Data.arrows.length; ++j) {
                    if (Id === Data.arrows[j].begin.id && type === Data.arrows[j].begin.type && reaction.id === Data.arrows[j].end.id) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = this.getObjectByTypeIndex(type, Id);
                    arrow.end = transition;
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;
                    Data.arrows.push(arrow);
                }
            }
            for (var i = 0; i < reaction.output.length; ++i) {
                var Id = parseInt(reaction.output[i].match(/\d+/g));
                var type = reaction.output[i].replace(/\d+/g, '');
                for (var j = 0; j < Data.arrows.length; ++j) {
                    if (reaction.id === Data.arrows[j].end.id && type === Data.arrows[j].end.type && Id === Data.arrows[j].begin.id) {
                        break;
                    }
                }
                if (j >= Data.arrows.length) {
                    var arrow = {};
                    arrow.type = "J";
                    arrow.begin = transition;
                    arrow.end = this.getObjectByTypeIndex(type, Id);
                    if(!arrow.begin||!arrow.end)
                        return;
                    arrow.end.flag = true;
                    arrow.begin.flag = true;

                    Data.arrows.push(arrow);
                }
            }
        }
    },
    getCompartmentByName: function (type, id) {
        switch (type) {
            case "Protein":  //Arrow (Black)
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].proteins.length; ++j) {
                        if (Data.compartments[i].proteins[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;
            case "Rna":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].rnas.length; ++j) {
                        if (Data.compartments[i].rnas[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;
            case "Dna":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].dnas.length; ++j) {
                        if (Data.compartments[i].dnas[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;
            case "SmallMolecule":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].molecules.length; ++j) {
                        if (Data.compartments[i].molecules[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;

            case "Complex":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].complexs.length; ++j) {
                        if (Data.compartments[i].complexs[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;

            case "PhysicalEntity":
                for (var i = 0; i < Data.compartments.length; ++i) {
                    for (var j = 0; j < Data.compartments[i].entitys.length; ++j) {
                        if (Data.compartments[i].entitys[j].id === id) {
                            return  Data.compartments[i];
                        }
                    }
                }
                return null;
            /*
             case "Rna":

             for(var i=0; i<Data.compartments.length; ++i)
             {
             for(var j=0; j< Data.compartments[i].dnas.length; ++j)
             {
             if(Data.compartments[i].dnas[j].id === id)
             {
             return  Data.compartments[i];
             }
             }
             }
             return null;  */
        }
    },
    processConvertedEntity: function (fileNum) {
        var fileName = fileNum + "_8convertedEntity.txt";
        var _this = this;
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");
                    for (var i = 0; i < lines.length; ++i) {
                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");

                            for (var k = 0; k < Data.compartments.length; ++k) {
                                if (Data.compartments[k].name === array[2]) {
                                    break;
                                }
                            }
                            if (k >= Data.compartments.length) {
                                var compartment = {};
                                compartment.x = 0;
                                compartment.y = 0;
                                compartment.w = 0;
                                compartment.h = 0;
                                compartment.complexs = [];
                                compartment.proteins = [];
                                compartment.entitys = [];
                                compartment.molecules = [];
                                compartment.dnas = [];
                                compartment.rnas = [];
                                compartment.associations = [];
                                compartment.dissociations = [];
                                compartment.transitions = [];
                                compartment.name = array[2];
                                var Id = parseInt(array[0].match(/\d+/g));
                                var type = array[0].replace(/\d+/g, '');
                                var reactomeDbId =  parseInt(array[3].match(/\d+/g));
                                _this.addElement(compartment, type, Id, array[1], reactomeDbId);
                                Data.compartments.push(compartment);
                            }
                            else {
                                var Id = parseInt(array[0].match(/\d+/g));
                                var type = array[0].replace(/\d+/g, '');
                                var reactomeDbId =  parseInt(array[3].match(/\d+/g));
                                _this.addElement(Data.compartments[k], type, Id, array[1], reactomeDbId);
                            }
                        }
                    }
                }
            }
        });
    },
    addElement: function (object, type, Id, name, reactomeDbId) {    //meeting with Su Liang: 7/30/2014 do not draw elements
        switch (type) {
            case "Protein":  //Arrow (Black)
                var protein = {};
                protein.id = Id;
                protein.type = "P";
                protein.name = name;
                protein.ReactomeDbId = reactomeDbId;
                protein.w = 40;
                protein.h = 15;
                protein.flag = false;
                for (var i = 0; i < object.proteins.length; ++i) {
                    if (object.proteins[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.proteins.length) {
                    object.proteins.push(protein);
                }
                break;
            case "Rna":
                var rna = {};
                rna.id = Id;
                rna.type = "Rna";
                rna.name = name;
                rna.ReactomeDbId = reactomeDbId;
                rna.w = 40;
                rna.h = 15;
                rna.flag = false;
                for (var i = 0; i < object.rnas.length; ++i) {
                    if (object.rnas[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.rnas.length) {
                    object.rnas.push(rna);
                }
                break;
            case "Dna":
                var dna = {};
                dna.id = Id;
                dna.type = "D";
                dna.name = name;
                dna.ReactomeDbId = reactomeDbId;
                dna.w = 40;
                dna.h = 15;
                dna.flag = false;
                for (var i = 0; i < object.dnas.length; ++i) {
                    if (object.dnas[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.dnas.length) {
                    object.dnas.push(dna);
                }
                break;
            case "SmallMolecule":
                var molecule = {};
                molecule.duplicates = [];
                molecule.duplicates.push(Id);
                molecule.id = Id;
                molecule.type = "S";
                molecule.name = name;
                molecule.ReactomeDbId = reactomeDbId;
                molecule.w = 40;
                molecule.h = 15;
                molecule.flag = false;
                for (var i = 0; i < object.molecules.length; ++i) {
                    if (object.molecules[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.molecules.length) {
                    object.molecules.push(molecule);
                }
                break;

            case "Complex":
                var complex = {};
                complex.id = Id;
                complex.type = "C";
                complex.name = name;
                complex.ReactomeDbId = reactomeDbId;
                complex.w = 15;    // Change to fixed size 7/14/2014
                complex.h = 6;
                complex.flag = false;
                for (var i = 0; i < object.complexs.length; ++i) {
                    if (object.complexs[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.complexs.length) {
                    object.complexs.push(complex);
                }
                break;

            case "PhysicalEntity":
                var entity = {};
                entity.id = Id;
                entity.type = "E";
                entity.name = name;
                entity.ReactomeDbId = reactomeDbId;
                entity.w = 30;
                entity.h = 13;
                entity.flag = false;
                for (var i = 0; i < object.entitys.length; ++i) {
                    if (object.entitys[i].id === Id) {
                        break;
                    }
                }
                if (i >= object.entitys.length) {
                    object.entitys.push(entity);
                }
                break;
        }
    },
    processReactionControl: function (fileNum) {
        var fileName = fileNum + "_5catalysisControl.txt";
        var _this = this;
        $.ajax({
            type: "GET",
            url: "./pathFiles/" + fileName,
            dataType: "text",
            async: false, //blocks window close
            success: function (result) {
                if (result) {
                    var lines = result.split("\n");

                    for (var i = 0; i < lines.length; ++i) {
                        if (lines[i] !== "") {
                            var array = lines[i].split("\t");
                            if (array[2].replace(/\d+/g, '') !== "BiochemicalReaction") {
                                continue;
                            }
                            var beginId = parseInt(array[1].match(/\d+/g));
                            var beginType = array[1].replace(/\d+/g, '');
                            var begin = _this.getObjectByTypeIndex(beginType, beginId);
                            if(!begin)
                                continue;
                            var endId = parseInt(array[2].match(/\d+/g));
                            for (var j = 0; j < _this.reactions.length; ++j) {
                                if (_this.reactions[j].id === endId) {
                                    var end = _this.reactions[j];
                                }
                            }

                            if (array[3] === "ACTIVATION") {

                                if (array[2].replace(/\d+/g, '') !== "BiochemicalReaction"|| array[1].replace(/\d+/g, '') === "NA" || array[2].replace(/\d+/g, '') === "NA") {
                                    continue; //Here I skip The BiochemicalReaction whose input or output is "NA"
                                }
                                if (j >= Data.activations.length) {
                                    var activation = {};
                                    activation.type = "A";
                                    activation.id = parseInt(array[0].match(/\d+/g));
                                    begin.flag = true;
                                    activation.begin = begin;
                                    end.flag = true;
                                    activation.end = end;

                                    Data.activations.push(activation);
                                }
                            }
                            else if (array[3] === "INHIBITION") {
                                for (var j = 0; j < Data.inhibitions.length; ++j) {
                                    if (begin.id === Data.inhibitions[j].begin.id && end.id === Data.inhibitions[j].end.id) {
                                        break;
                                    }
                                }
                                if (j >= Data.inhibitions.length) {
                                    var inhibition = {};
                                    inhibition.type = "I";
                                    inhibition.id = parseInt(array[0].match(/\d+/g));
                                    begin.flag = true;
                                    inhibition.begin = begin;
                                    end.flag = true;
                                    inhibition.end = end;

                                    Data.inhibitions.push(inhibition);
                                }
                            }
                        }
                    }
                }
            }
        });
    },
    removeUnwantedData: function () {
        //This is try to remove the node that does not want to be drawn.
        for (var i = 0; i < Data.compartments.length; ++i) {
            var complexs = Data.compartments[i].complexs;
            for (var j = complexs.length - 1; j >= 0; j--) {
                if (complexs[j].flag === false) {
                    complexs.splice(j, 1);
                }
            }
            var proteins = Data.compartments[i].proteins;
            for (var j = proteins.length - 1; j >= 0; j--) {
                if (proteins[j].flag === false) {
                    proteins.splice(j, 1);
                }
            }
            var molecules = Data.compartments[i].molecules;
            for (var j = molecules.length - 1; j >= 0; j--) {
                if (molecules[j].flag === false) {
                    molecules.splice(j, 1);
                }
            }
            var dnas = Data.compartments[i].dnas;
            for (var j = dnas.length - 1; j >= 0; j--) {
                if (dnas[j].flag === false) {
                    dnas.splice(j, 1);
                }
            }
            var rnas = Data.compartments[i].rnas;
            for (var j = rnas.length - 1; j >= 0; j--) {
                if (rnas[j].flag === false) {
                    rnas.splice(j, 1);
                }
            }
            var entitys = Data.compartments[i].entitys;
            for (var j = entitys.length - 1; j >= 0; j--) {
                if (entitys[j].flag === false) {
                    entitys.splice(j, 1);
                }
            }
        }
        for (var i = Data.compartments.length - 1; i >= 0; i--) {
            if (Data.compartments[i].complexs.length === 0 &&
                Data.compartments[i].proteins.length === 0 &&
                Data.compartments[i].molecules.length === 0 &&
                Data.compartments[i].dnas.length === 0 &&
                Data.compartments[i].rnas.length === 0 &&
                Data.compartments[i].entitys.length === 0) {
                Data.compartments.splice(i, 1);
            }
        }
    },
    setCompartIdforElement: function () {
        //Add id for each compartment and add compartmentId for each node inside the compartment
        //Create the graph object for Force Direct Algorithm
        //Add node for each graph
        for (var i = 0; i < Data.compartments.length; ++i) {
            Data.compartments[i].id = i;
            Data.compartments[i].to = [];   //compartment connects with other compartment
            var graph = new Graph();
            graph.compartmentId = i;

            var nodeIndex = 0; //the index in each graph
            var complexs = Data.compartments[i].complexs;
            for (var j = complexs.length - 1; j >= 0; j--) {
                complexs[j].compartmentId = i;
                complexs[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, complexs[j]);
                nodeIndex++;
            }
            var proteins = Data.compartments[i].proteins;
            for (var j = proteins.length - 1; j >= 0; j--) {
                proteins[j].compartmentId = i;
                proteins[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, proteins[j]);
                nodeIndex++;
            }
            var molecules = Data.compartments[i].molecules;
            for (var j = molecules.length - 1; j >= 0; j--) {
                molecules[j].compartmentId = i;
                molecules[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, molecules[j]);
                nodeIndex++;
            }
            var dnas = Data.compartments[i].dnas;
            for (var j = dnas.length - 1; j >= 0; j--) {
                dnas[j].compartmentId = i;
                dnas[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, dnas[j]);
                nodeIndex++;
            }
            var rnas = Data.compartments[i].rnas;
            for (var j = rnas.length - 1; j >= 0; j--) {
                rnas[j].compartmentId = i;
                rnas[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, rnas[j]);
                nodeIndex++;
            }
            var entitys = Data.compartments[i].entitys;
            for (var j = entitys.length - 1; j >= 0; j--) {
                entitys[j].compartmentId = i;
                entitys[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, entitys[j]);
                nodeIndex++;
            }
            var associations = Data.compartments[i].associations;
            for (var j = associations.length - 1; j >= 0; j--) {
                associations[j].compartmentId = i;
                associations[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, associations[j]);
                nodeIndex++;
            }
            var dissociations = Data.compartments[i].dissociations;
            for (var j = dissociations.length - 1; j >= 0; j--) {
                dissociations[j].compartmentId = i;
                dissociations[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, dissociations[j]);
                nodeIndex++;
            }
            var transitions = Data.compartments[i].transitions;
            for (var j = transitions.length - 1; j >= 0; j--) {
                transitions[j].compartmentId = i;
                transitions[j].nodeIndex = nodeIndex;
                graph.addEachNode(nodeIndex, transitions[j]);
                nodeIndex++;
            }
            for (var j = 0; j < graphs.length; ++j) {
                if (graphs[j].compartmentId === i) {
                    break;
                }
            }
            if (j >= graphs.length) {
                graphs.push(graph);
            }
        }
    },
    setCompartmentRelationship: function () {
        // Calculate the number of links connect between compartments
        // Add node links for Force direct for each graph
        var compartment;
        for (var i = 0; i < Data.activations.length; ++i) {
            if (Data.activations[i].begin.compartmentId !== Data.activations[i].end.compartmentId) {

                for (var j = 0; j < Data.compartments.length; ++j) {
                    if (Data.activations[i].begin.compartmentId === Data.compartments[j].id) {
                        compartment = Data.compartments[j];
                    }
                }
                for (var j = 0; j < compartment.to.length; ++j) {
                    if (compartment.to[j].compartmentId === Data.activations[i].end.compartmentId) {
                        break;
                    }
                }
                if (j >= compartment.to.length) {
                    var tmp = {};
                    tmp.compartmentId = Data.activations[i].end.compartmentId;
                    tmp.count = 1;
                    compartment.to.push(tmp);
                }
                else {
                    compartment.to[j].count++;
                }
            }
        }
        for (var i = 0; i < Data.arrows.length; ++i) {
            if (Data.arrows[i].begin.compartmentId !== Data.arrows[i].end.compartmentId) {

                for (var j = 0; j < Data.compartments.length; ++j) {
                    if (Data.arrows[i].begin.compartmentId === Data.compartments[j].id) {
                        compartment = Data.compartments[j];
                    }
                }
                for (var j = 0; j < compartment.to.length; ++j) {
                    if (compartment.to[j].compartmentId === Data.arrows[i].end.compartmentId) {
                        break;
                    }
                }
                if (j >= compartment.to.length) {
                    var tmp = {};
                    tmp.compartmentId = Data.arrows[i].end.compartmentId;
                    tmp.count = 1;
                    compartment.to.push(tmp);
                }
                else {
                    compartment.to[j].count++;
                }
            }
        }
        for (var i = 0; i < Data.inhibitions.length; ++i) {
            if (Data.inhibitions[i].begin.compartmentId !== Data.inhibitions[i].end.compartmentId) {
                for (var j = 0; j < Data.compartments.length; ++j) {
                    if (Data.inhibitions[i].begin.compartmentId === Data.compartments[j].id) {
                        compartment = Data.compartments[j];
                    }
                }
                for (var j = 0; j < compartment.to.length; ++j) {
                    if (compartment.to[j].compartmentId === Data.inhibitions[i].end.compartmentId) {
                        break;
                    }
                }
                if (j >= compartment.to.length) {
                    var tmp = {};
                    tmp.compartmentId = Data.inhibitions[i].end.compartmentId;
                    tmp.count = 1;
                    compartment.to.push(tmp);
                }
                else {
                    compartment.to[j].count++;
                }
            }
        }

    },
    addNodeLink: function () {
        for (var i = 0; i < Data.activations.length; ++i) {
            var activation = Data.activations[i];
            if (activation.begin.compartmentId === activation.end.compartmentId) {
                graphs[activation.begin.compartmentId].addEachLink(activation.begin.nodeIndex, activation.end.nodeIndex);
            }
        }

        for (var i = 0; i < Data.arrows.length; ++i) {
            var arrow = Data.arrows[i];
            if (arrow.begin.compartmentId === arrow.end.compartmentId) {
                graphs[arrow.begin.compartmentId].addEachLink(arrow.begin.nodeIndex, arrow.end.nodeIndex);
            }
        }
        for (var i = 0; i < Data.inhibitions.length; ++i) {
            var inhibition = Data.inhibitions[i];
            if (inhibition.begin.compartmentId === inhibition.end.compartmentId) {
                graphs[inhibition.begin.compartmentId].addEachLink(inhibition.begin.nodeIndex, inhibition.end.nodeIndex);
            }
        }

    },
    arrangeGraphBox: function () {
        //calculate each size for each compartment
        for (var i = 0; i < graphs.length; ++i) {
            var nodeNum = graphs[i].nodes.length;
            var idealH = Math.sqrt(nodeNum * 2000);
            var idealW = idealH / 0.618;
            Data.compartments[i].w = idealW;
            Data.compartments[i].h = idealH;
        }
        var hierarchy = new Hierarchy(Data.compartments);
        this.flag = true;
    },
    saveXML: function (str, processedIdex) {
        var results = [ ];
        results.push('<?xml version="1.0" encoding="ISO-8859-1"?>');
        results.push(preElement(false, "Pathway"));
        results.push(preElement(true, "ANodeBlock", " Num='0'"));  //has /
        var canvas = $("#bgCanvas")[0];
        var width = canvas.width;
        var height = canvas.height;
        results.push(preElement(false, "Canvas"));  //has /
        var position = "(";
        position += width;
        position += ",";
        position += height;
        position += ")";
        results.push(element("Size", position));
        results.push(postElement("Canvas"));
        //results.push(preElement(false, "parentName"));  //has /
        //results.push(element("Name", str[processedIdex].parentName));
        //results.push(postElement("parentName"));
        var childrenName = "";
        childrenName += "(";
        for(var i=0; i< str[processedIdex].children.length; ++i)
        {
            childrenName += str[processedIdex].children[i].name;
            if(i< str[processedIdex].children.length-1)
                childrenName +=",";
        }
        childrenName += ")";
        results.push(preElement(false, "ChildrenName"));  //has /
        results.push(element("Name", childrenName));
        results.push(postElement("ChildrenName"));
        var compartments = Data.compartments;
        var num = " Num = '";
        num += compartments[compartments.length - 1].id;
        num += "'";
        results.push(preElement(false, "compartmentBlock ", num));  //has /
        var complexLength = 0, entityLength = 0, proteinLength = 0, smallMoleculeLength = 0, reactionLength = 0;
        for (var i = 0; i < compartments.length; ++i) {
            var a = " j = '";
            a += compartments[i].id;
            a += "'";
            results.push(preElement(false, "compartment", a));

            var name = compartments[i].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
            results.push(element("Name", name));
            var position = "(";
            position += compartments[i].x / width;
            position += ",";
            position += compartments[i].y / height;
            position += ",";
            position += compartments[i].w / width;
            position += ",";
            position += compartments[i].h / height;
            position += ")";
            results.push(element("Position", position));

            var contain = "(";
            var complexs = compartments[i].complexs;
            complexLength += complexs.length;
            for (var k = 0; k < complexs.length; ++k) {
                contain += "C,";
                contain += complexs[k].id;
                contain += ",";
                contain += complexs[k].ReactomeDbId; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }

            var entitys = compartments[i].entitys;
            entityLength += entitys.length;
            for (var k = 0; k < entitys.length; ++k) {
                contain += "E,";
                contain += entitys[k].id;
                contain += ",";
                contain += entitys[k].ReactomeDbId; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }
            /*
             var dnas = compartments[i].dnas;
             dnaLength += dnas.length;
             for (var k = 0; k < dnas.length; ++k) {
             contain += "D, ";
             contain += dnas[k].id;
             contain += ", ";
             } */
            var proteins = compartments[i].proteins;
            proteinLength += proteins.length;
            for (var k = 0; k < proteins.length; ++k) {
                contain += "P,";
                contain += proteins[k].id;
                contain += ",";
                contain += proteins[k].ReactomeDbId; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }

            var molecules = compartments[i].molecules;
            smallMoleculeLength += molecules.length;
            for (var k = 0; k < molecules.length; ++k) {
                contain += "S,";
                contain += molecules[k].id;
                contain += ",";
                contain += molecules[k].ReactomeDbId; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }

            var associations = compartments[i].associations;
            reactionLength += associations.length;
            for (var k = 0; k < associations.length; ++k) {
                contain += "R,";
                contain += associations[k].id;
                contain += ",";
                contain += 0; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }
            var dissociations = compartments[i].dissociations;
            reactionLength += dissociations.length;
            for (var k = 0; k < dissociations.length; ++k) {
                contain += "R,";
                contain += dissociations[k].id;
                contain += ",";
                contain += 0; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }

            var transitions = compartments[i].transitions;
            reactionLength += transitions.length;
            for (var k = 0; k < transitions.length; ++k) {
                contain += "R,";
                contain += transitions[k].id;
                contain += ",";
                contain += 0; //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
                contain += ",";
            }
            contain += ")";
            results.push(element("Contain", contain));
            results.push(postElement("compartment"));
        }
        results.push(postElement("compartmentBlock "));
        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].complexs.length; ++j) {
                maxid = Math.max(maxid, compartments[i].complexs[j].id);
            }
        }
        var num = " Num = '";
        num += maxid + 1;
        num += "'";
        results.push(preElement(false, "complexBlock ", num));  //has /
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].complexs.length; ++j) {
                if (compartments [ compartments[i].complexs[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].complexs[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].complexs[j].id;
                    a += "'";
                    results.push(preElement(false, "complex", a));
                    var name = compartments[i].complexs[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].complexs[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].complexs[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].complexs[j].w / w;
                    position += ",";
                    position += compartments[i].complexs[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("complex"));
                }
            }
        }
        results.push(postElement("complexBlock"));

        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].entitys.length; ++j) {
                maxid = Math.max(maxid, compartments[i].entitys[j].id);
            }
        }
        var num = " Num = '";
        num += maxid + 1;
        num += "'";
        results.push(preElement(false, "physicalEntityBlock ", num));  //has /
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].entitys.length; ++j) {
                if (compartments [ compartments[i].entitys[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].entitys[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].entitys[j].id;
                    a += "'";
                    results.push(preElement(false, "physicalEntity", a));
                    var name = compartments[i].entitys[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].entitys[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].entitys[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].entitys[j].w / w;
                    position += ",";
                    position += compartments[i].entitys[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("physicalEntity"));
                }
            }
        }
        results.push(postElement("physicalEntityBlock"));

        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].proteins.length; ++j) {
                maxid = Math.max(maxid, compartments[i].proteins[j].id);
            }
        }
        var num = " Num = '";
        num += maxid + 1;
        num += "'";
        results.push(preElement(false, "proteinBlock ", num));  //has /
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].proteins.length; ++j) {
                if (compartments [ compartments[i].proteins[j].compartmentId  ]) {

                    var currentCompartment = compartments [ compartments[i].proteins[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;

                    var a = " j = '";
                    a += compartments[i].proteins[j].id;
                    a += "'";
                    results.push(preElement(false, "protein ", a));
                    var name = compartments[i].proteins[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].proteins[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].proteins[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].proteins[j].w / w;
                    position += ",";
                    position += compartments[i].proteins[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("protein "));
                }
            }
        }
        results.push(postElement("proteinBlock"));

        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].dnas.length; ++j) {
                maxid = Math.max(maxid, compartments[i].dnas[j].id);
            }
        }
        var num = " Num = '";
        num += maxid +1;
        num += "'";
        results.push(preElement(false, "DnaBlock ", num));  //has /
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].dnas.length; ++j) {
                if (compartments [ compartments[i].dnas[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].dnas[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;

                    var a = " j = '";
                    a += compartments[i].dnas[j].id;
                    a += "'";
                    results.push(preElement(false, "dna ", a));
                    var name = compartments[i].dnas[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].dnas[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].dnas[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].dnas[j].w / w;
                    position += ",";
                    position += compartments[i].dnas[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("dna "));
                }
            }
        }
        results.push(postElement("DnaBlock"));

        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].rnas.length; ++j) {
                maxid = Math.max(maxid, compartments[i].rnas[j].id);
            }
        }
        var num = " Num = '";
        num += maxid +1;
        num += "'";
        results.push(preElement(false, "RnaBlock ", num));  //has /
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].rnas.length; ++j) {
                if (compartments [ compartments[i].rnas[j].compartmentId  ]) {

                    var currentCompartment = compartments [ compartments[i].rnas[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;

                    var a = " j = '";
                    a += compartments[i].rnas[j].id;
                    a += "'";
                    results.push(preElement(false, "rna ", a));
                    var name = compartments[i].rnas[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].rnas[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].rnas[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].rnas[j].w / w;
                    position += ",";
                    position += compartments[i].rnas[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("rna "));
                }
            }
        }
        results.push(postElement("RnaBlock"));

        var maxid = 0;
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].molecules.length; ++j) {
                maxid = Math.max(maxid, compartments[i].molecules[j].id);
            }
        }
        var num = " Num = '";
        num += maxid + 1;
        num += "'";
        results.push(preElement(false, "smallMoleculeBlock ", num));
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].molecules.length; ++j) {
                if (compartments [ compartments[i].molecules[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].molecules[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].molecules[j].id;
                    a += "'";
                    results.push(preElement(false, "smallMolecule ", a));
                    var name = compartments[i].molecules[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var position = "(";
                    position += (compartments[i].molecules[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].molecules[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].molecules[j].w / w;
                    position += ",";
                    position += compartments[i].molecules[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    var duplicateMolecules = "(";
                    if(compartments[i].molecules[j].duplicates.length>1)
                    {
                        for(var ks = 0; ks<compartments[i].molecules[j].duplicates.length; ++ks)
                        {
                            duplicateMolecules += compartments[i].molecules[j].duplicates[ks];
                            if(ks<compartments[i].molecules[j].duplicates.length-1)
                                duplicateMolecules += ",";
                        }
                    }
                    duplicateMolecules +=  ")";
                    results.push(element("DuplicateMolecules", duplicateMolecules));
                    results.push(postElement("smallMolecule "));
                }
            }
        }
        results.push(postElement("smallMoleculeBlock "));

        var num = " Num = '";
        num += reactionLength + 1;
        num += "'";
        results.push(preElement(false, "reactionBlock ", num));
        for (var i = 0; i < compartments.length; ++i) {
            for (var j = 0; j < compartments[i].associations.length; ++j) {
                if (compartments [ compartments[i].associations[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].associations[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].associations[j].id;
                    a += "'";
                    results.push(preElement(false, "reaction ", a));
                    var name = compartments[i].associations[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var type = "B";
                    results.push(element("Type", type));

                    var position = "(";
                    position += (compartments[i].associations[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].associations[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].associations[j].w / w;
                    position += ",";
                    position += compartments[i].associations[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("reaction "));
                }
            }
            for (var j = 0; j < compartments[i].dissociations.length; ++j) {
                if (compartments [ compartments[i].dissociations[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].dissociations[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].dissociations[j].id;
                    a += "'";
                    results.push(preElement(false, "reaction ", a));
                    var name = compartments[i].dissociations[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var type = "K";
                    results.push(element("Type", type));

                    var position = "(";
                    position += (compartments[i].dissociations[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].dissociations[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].dissociations[j].w / w;
                    position += ",";
                    position += compartments[i].dissociations[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("reaction "));
                }
            }
            for (var j = 0; j < compartments[i].transitions.length; ++j) {
                if (compartments [ compartments[i].transitions[j].compartmentId  ]) {
                    var currentCompartment = compartments [ compartments[i].transitions[j].compartmentId  ];
                    var childOffsetx = currentCompartment.x;
                    var childOffsety = currentCompartment.y;
                    var offsetX = childOffsetx - currentCompartment.x;
                    var offsetY = childOffsety - currentCompartment.y;
                    var w = currentCompartment.w;
                    var h = currentCompartment.h;
                    var a = " j = '";
                    a += compartments[i].transitions[j].id;
                    a += "'";
                    results.push(preElement(false, "reaction ", a));
                    var name = compartments[i].transitions[j].name.replace( /[<>:,&.'"\/\\|?*]+/g, '' );
                    results.push(element("Name", name));
                    var type = "T";
                    results.push(element("Type", type));

                    var position = "(";
                    position += (compartments[i].transitions[j].x + offsetX) / w;
                    position += ",";
                    position += (compartments[i].transitions[j].y + offsetY) / h;
                    position += ",";
                    position += compartments[i].transitions[j].w / w;
                    position += ",";
                    position += compartments[i].transitions[j].h / h;
                    position += ")";
                    results.push(element("Position", position));
                    results.push(postElement("reaction "));
                }
            }
        }
        results.push(postElement("reactionBlock"));

        var edgeLength = 0;
        edgeLength += Data.activations.length;
        edgeLength += Data.arrows.length;
        edgeLength += Data.inhibitions.length;

        var num = " Num = '";
        num += edgeLength;
        num += "'";
        results.push(preElement(false, "edgeBlock ", num));  //has /
        var index = 0;
        for (var j = 0; j < Data.activations.length; ++j) {
            var a = " j = '";
            a += j + index;
            a += "'";
            results.push(preElement(false, "edge ", a));
            var name = "A";
            results.push(element("Name", name));

            var ends = "(";
            if (Data.activations[j].begin.type === "T" || Data.activations[j].begin.type === "B" || Data.activations[j].begin.type === "K")
                ends += "R";
            else
                ends += Data.activations[j].begin.type;
            ends += ", ";
            ends += Data.activations[j].begin.id;
            ends += ", ";
            if (Data.activations[j].end.type === "T" || Data.activations[j].end.type === "B" || Data.activations[j].end.type === "K")
                ends += "R";
            else
                ends += Data.activations[j].end.type;
            ends += ", ";
            ends += Data.activations[j].end.id;
            ends += ")";
            results.push(element("Ends", ends));
            results.push(postElement("edge "));
        }
        index = Data.activations.length;
        for (var j = 0; j < Data.arrows.length; ++j) {
            var a = " j = '";
            a += index + j;
            a += "'";
            results.push(preElement(false, "edge ", a));
            var name = "J";
            results.push(element("Name", name));

            var ends = "(";
            if (Data.arrows[j].begin.type === "T" || Data.arrows[j].begin.type === "B" || Data.arrows[j].begin.type === "K")
                ends += "R";
            else
                ends += Data.arrows[j].begin.type;
            ends += ", ";
            ends += Data.arrows[j].begin.id;
            ends += ", ";
            if (Data.arrows[j].end.type === "T" || Data.arrows[j].end.type === "B" || Data.arrows[j].end.type === "K")
                ends += "R";
            else
                ends += Data.arrows[j].end.type;
            ends += ", ";
            ends += Data.arrows[j].end.id;
            ends += ")";
            results.push(element("Ends", ends));
            results.push(postElement("edge "));
        }
        index = Data.arrows.length + Data.activations.length;
        for (var j = 0; j < Data.inhibitions.length; ++j) {
            var a = " j = '";
            a += j + index;
            a += "'";
            results.push(preElement(false, "edge ", a));
            var name = "I";
            results.push(element("Name", name));

            var ends = "(";
            if (Data.inhibitions[j].begin.type === "T" || Data.inhibitions[j].begin.type === "B" || Data.inhibitions[j].begin.type === "K")
                ends += "R";
            else
                ends += Data.inhibitions[j].begin.type;
            ends += ", ";
            ends += Data.inhibitions[j].begin.id;
            ends += ", ";
            if (Data.inhibitions[j].end.type === "T" || Data.inhibitions[j].end.type === "B" || Data.inhibitions[j].end.type === "K")
                ends += "R";
            else
                ends += Data.inhibitions[j].end.type;
            ends += ", ";
            ends += Data.inhibitions[j].end.id;
            ends += ")";
            results.push(element("Ends", ends));
            results.push(postElement("edge "));
        }
        results.push(postElement("edgeBlock "));
        results.push(postElement("Pathway"));
        var end_result = results.join(' ');
        var fileName = str[processedIdex].name;
        //fileName = fileName.replace( /[<>:,."\/\\|?*]+/g, '' );
        var parts = fileName.split(".");
        fileName = parts[0];
        $.ajax({
            url: 'xml.php',
            type: "POST",  // type should be POST
            data: {
                xml: end_result,
                name: "./XMLdata/" + fileName + ".xml"
            }, // send the string directly
            dataType: "text",
            success: function (data) {
                //console.log(data);
                return true;
            },
            complete: function () {
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log('ajax loading error...');
                return false;
            }
        });
        function preElement(flag, name, attributes) {   //http://oreilly.com/pub/h/2127
            var xml;
            if (flag) {
                if (attributes !== undefined)
                    xml = '<' + name + attributes + '/>';
                else
                    xml = '<' + name + '/>';
            }
            else {
                if (attributes !== undefined)
                    xml = '<' + name + attributes + '>';
                else
                    xml = '<' + name + '>';

            }
            return xml
        }

        function postElement(name) {   //http://oreilly.com/pub/h/2127
            var xml;
            xml = '</' + name + '>';
            return xml
        }

// XML writer with attributes and smart attribute quote escaping
        function element(name, content, attributes) {   //http://oreilly.com/pub/h/2127

            var xml;
            if (!content) {
                if (attributes !== undefined)
                    xml = '<' + name + attributes + '/>';
                else
                    xml = '<' + name + '/>';
            }
            else {
                if (attributes !== undefined)
                    xml = '<' + name + attributes + '>' + content + '</' + name + '>';
                else
                    xml = '<' + name + '>' + content + '</' + name + '>';
            }
            return xml
        }

    }
};
