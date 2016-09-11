define([
        './module'
        ], function (module) {

  'use strict';

  module.service('projectService', function(localStorageService){
    var createNewProject = function(projectName, projectType){
      return {
        name: projectName || "",
        projectType: projectType,
        settings: {},
        configs: {}
      };
    };

    this.setNewProject = function(projectName, projectType){
      var project = createNewProject(projectName, projectType);
      this.setProject(project);
    };

    this.setProject = function(project){
      this.project = project;
      localStorageService.set("project", this.getProject());
    };

    this.handleProjectJson = function(projectJson, action){
      var status = 'unknown action';
      var project;

      try{
        project = JSON.parse(projectJson);

        switch(action){
          case 'openProject':
            if(
              (project.projectType == 'template' || project.projectType == 'implementation') &&
              typeof project.configs == 'object'
            ){
              status = 'OK';
            } else {
              status = 'cannot open project';
            }
            break;

          case 'implementTemplate':
            if(project.projectType == 'template'){
              project.projectType = 'implementation';
              status = 'OK';
            } else {
              status = 'cannot open template to implement';
            }
            break;
        }

        if(status == 'OK'){
          this.project = project;
        } else {
          throw "Project error: " + status;
        }
      } catch(err) {
        console.log("Could open project file: " + err);
        project = undefined;
      } finally {
        return project;
      }
    };

    this.getLocallyPersistedProject = function(){
      return localStorageService.get("project") || createNewProject("", "template");
    };

    this.getProject = function(){
      return this.project;
    };

    this.getProjectName = function(){
      return this.project.name;
    }

    this.setBlocksXml = function(configName, editionMode, blocksXml){
      var configs = this.project.configs;
      if(configs[configName]){
        configs[configName][editionMode] = blocksXml;
        this.setProject(this.project);
      }
    };

    this.getBlocksXml = function(configName, editionMode){
      var configs = this.project.configs;
      if(editionMode == 'implementation' && !(editionMode in configs[configName])){
        editionMode = 'template';
      }
      return configs[configName] && configs[configName][editionMode];
    };

    this.getProjectType = function(){
      return this.project.projectType;
    };

    this.getConfigNames = function(){
      var names = [];
      for(var key in this.project.configs){
        names.push(key);
      }
      names.sort();
      return names;
    };

    this.addConfig = function(configName, fileName){
      var config = {
        fileName: fileName
      };
      if(!(configName in this.project.configs)){
        this.project.configs[configName] = config;
      }
      this.setProject(this.project);
    };

    this.removeConfig = function(configName){
      delete this.project.configs[configName];
      this.setProject(this.project);
    };


    this.setProject(this.getLocallyPersistedProject());
  });

});

