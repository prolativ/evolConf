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

    function openTextInputModal(title, prompt, initialText){
      return $uibModal.open({
        animation: true,
        templateUrl: '/html/textInputModal.html',
        controller: 'TextInputModalCtrl',
        controllerAs: 'modalCtrl',
        resolve: {
          title: function(){return title;},
          prompt: function(){return prompt;},
          initialText: function(){return initialText;}
        }
      });
    }

    this.msg = msg;

    this.newTemplateAction = function(){
      var modalInstance = openTextInputModal(msg.project.create, msg.project.name, "");

      var self = this;
      modalInstance.result.then(function (text) {
        projectService.setNewProject(text, 'template');
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
        $rootScope.$broadcast('projectLoaded');
      } else {
        alert("Project not loaded successfully.");
      }
    };

    this.saveProjectAction = function(){
      var project = projectService.getProject();
      var modalInstance = openTextInputModal(msg.project.save, msg.project.name, projectService.getProject().name)

      modalInstance.result.then(function (text) {
        var persistableProject = projectService.getProject();
        persistableProject.name = text;
        downloadTextFile(text + ".json", JSON.stringify(persistableProject));
      });
    };

  }]);

});