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
        //functionBlocksXmls: []
        functionBlocksXmls: [{}] // mock for exactly 1 config function
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

      console.log("handling", action);

      try{
        project = JSON.parse(projectJson);

        switch(action){
          case 'openProject':
            if(
              (project.projectType == 'template' || project.projectType == 'implementation') &&
              typeof project.functionBlocksXmls == 'object'
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

    this.setBlocksXml = function(index, editionMode, blocksXml){
      console.log(index, editionMode, blocksXml);
      this.project.functionBlocksXmls[index][editionMode] = blocksXml;
      this.setProject(this.project);
    };

    this.getBlocksXml = function(index, editionMode){
      return this.project.functionBlocksXmls[index][editionMode];
    }

    this.getProjectType = function(){
      return this.project.projectType;
    }

    this.setProject(this.getLocallyPersistedProject());
  });

});

