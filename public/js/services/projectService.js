define([
        './module'
        ], function (module) {

  'use strict';

  module.service('projectService', function(localStorageService){
    var createNewProject = function(projectName){
      return {
        name: projectName || "",
        settings: {},
        blocksXml: undefined
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

    this.getProject = function(project){
      return this.project;
    };

    this.setBlocksXml = function(blocksXml){
      this.project.blocksXml = blocksXml;
      this.setProject(this.project);
    };

    this.setProject(this.getLocallyPersistedProject());
  });

});

