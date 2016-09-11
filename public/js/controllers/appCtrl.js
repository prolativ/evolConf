define(['./module',
        'app.msg'],
        function (module, msg) {

  'use strict';

  module.controller('AppCtrl',
      ['$scope', '$rootScope', '$uibModal', 'projectService',
      function ($scope, $rootScope, $uibModal, projectService) {

    function downloadTextFile(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }

    function openTextInputModal(title, inputs){
      return $uibModal.open({
        animation: true,
        templateUrl: '/html/textInputModal.html',
        controller: 'TextInputModalCtrl',
        controllerAs: 'modalCtrl',
        resolve: {
          title: function(){return title;},
          inputs: function(){return inputs;}
        }
      });
    }

    this.msg = msg;

    this.newTemplateAction = function(){
      var modalInstance = openTextInputModal(msg.project.create, [
        {
          key: "projectName",
          prompt: msg.project.name,
          initialText: ""
        }
      ]);

      var self = this;
      modalInstance.result.then(function (inputs) {
        var nameInput = inputs.find(function(element){
          return element.key == 'projectName';
        });
        projectService.setNewProject(nameInput.text, 'template');
        $rootScope.$broadcast('projectLoaded');
      });
    };

    this.openProjectAction = function(){
      this.openFileChooser('file-input-open-project');
    };

    this.implementTemplateAction = function(){
      this.openFileChooser('file-input-implement-template');
    };

    this.openFileChooser = function(id){
      $('#' + id).val("");
      $('#' + id).click();
    };

    this.handleOpenFile = function(fileContent, action){
      var project = projectService.handleProjectJson(fileContent, action);
      if(project){
        $rootScope.$broadcast('projectLoaded', action);
      } else {
        alert("Project not loaded successfully.");
      }
    };

    this.saveProjectAction = function(){
      var project = projectService.getProject();
      var modalInstance = openTextInputModal(msg.project.save, [
        {
          key: "projectName",
          prompt: msg.project.name,
          initialText: projectService.getProjectName()
        }
      ]);

      modalInstance.result.then(function (inputs) {
        var nameInput = inputs.find(function(element){
          return element.key == 'projectName';
        });
        var persistableProject = projectService.getProject();
        persistableProject.name = nameInput.text;
        downloadTextFile(nameInput.text + ".json", JSON.stringify(persistableProject));
      });
    };

    this.addConfigAction = function(){
      var modalInstance = openTextInputModal(msg.project.save, [
        {
          key: "configName",
          prompt: msg.config.name,
          initialText: ""
        },
        {
          key: "fileName",
          prompt: msg.config.fileName,
          initialText: ""
        },
      ]);

      modalInstance.result.then(function (inputs) {
        var configNameInput = inputs.find(function(element){
          return element.key == 'configName';
        });
        var fileNameInput = inputs.find(function(element){
          return element.key == 'fileName';
        });

        projectService.addConfig(configNameInput.text, fileNameInput.text);
        $rootScope.$broadcast('configAdded', configNameInput.text);
      });
    };

  }]);

});