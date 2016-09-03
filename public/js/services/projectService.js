define([
        './module'
        ], function (module) {

  'use strict';

  module.service('projectService', function(localStorageService){
    var createNewProject = function(projectName){
      return {
        name: projectName || "",
        settings: {},
        //functionBlocksXmls: []
        functionBlocksXmls: [{}] // for exactly 1 config function
      };
    };

    this.setNewProject = function(projectName){
      var project = createNewProject(projectName);
      this.setProject(project);
    };

    this.setProject = function(project){
      this.project = project;
      localStorageService.set("project", this.getProject());
    };

    this.setProjectFromJson = function(projectJson){
      try{
        var project = JSON.parse(projectJson);
        this.project = project;
      }catch(err){
        console.log("Could not load project from JSON: " + err);
      }
    };

    this.getLocallyPersistedProject = function(){
      return localStorageService.get("project") || createNewProject();
    };

    this.getProject = function(){
      return this.project;
    };

    this.setBlocksXml = function(index, editionMode, blocksXml){
      console.log(index, editionMode, blocksXml);
      this.project.functionBlocksXmls[index][editionMode] = blocksXml;
      this.setProject(this.project);
    };

    this.getBlocksXml = function(index, editionMode){
      return this.project.functionBlocksXmls[index][editionMode];
    }

    this.setProject(this.getLocallyPersistedProject());
  });

});

