export default class Renderer
{
    constructor(VaultAPI, ForgeAPI) {
        this.VaultAPI = VaultAPI;
        this.ForgeAPI = ForgeAPI;
        this._renderedFiles = {};
    }


    _setRenderedFile (file, urn) {
        this._renderedFiles[file.Id] = urn;
    }
      
    getRendering(file) {
        return this._renderedFiles[file.Id] || null;
    }

    resetData() {
        this._renderedFiles = {}; 
        this._currentJob = {};
    }

    getCurrentJob() {
        if( this._currentJob.done || !this._currentJob.urn ) { 
            return new P(function(resolve, reject) { // return immediate result in a promise
                resolve(this._currentJob);
            }.bind(this));
        }

        return this._getRenderStatus(this._currentJob.urn)
        .then(function(result) {
            this._currentJob.renderStatus = result;
            this._onRenderProgress();
            return this._currentJob;
        }.bind(this));
    }

    renderFile(file) {
        this._currentJob = { file: file, done: false, urn: null };
        var fileDictionary;
        var fileAssociations;

        this.VaultAPI.DocService.GetFileDependencies(file)
        .then(function(result) {
            fileAssociations = result;
            fileDictionary = this._createFileDictionary(file, fileAssociations);
            return this._transferAllFiles(_.values(fileDictionary));
         }.bind(this))
         .then(function() { 
            var relationships = this._createRelationships(file, fileAssociations, fileDictionary);
            return this.ForgeAPI.createRelationships(relationships);
         }.bind(this))
         .then(function() {
            this._currentJob.urn = file.urn;
            return this.ForgeAPI.registerView(file.urn);
         }.bind(this));
    }

    _transferAllFiles(files) {
        this._initFileUpload(files.length);
        return this.VaultAPI.DocService.GetDownloadTickets(files)
        .then(function() {
            return P.all(files.map(this._transferFile.bind(this)));
        }.bind(this));
    };

    _transferFile(file) {
         return this.VaultAPI.FilestoreService.DownloadFile(file)
        .then(function(base64data) {
            return this.ForgeAPI.uploadFile(file, base64data);
        }.bind(this))
        .then(function(result) {
            this._onFileUpload();
            file.urn = result.urn;
            return result.urn;
        }.bind(this));
    };

    _getRenderStatus(urn) {
        return this.ForgeAPI.getViewStatus(urn)
        .then( function(result) {
            console.log('awaiting render')
            console.log(result.progress);
            return result;
        });
    };

    _createFileDictionary(parentFile, dependencies) {  // this will also eliminate duplicates
        var mapping = { };
        mapping[parentFile.Id] = parentFile;

        for( var i = 0; i < dependencies.length; i ++) {
            mapping[dependencies[i].CldFile.Id] = dependencies[i].CldFile;
        }

        return mapping;
    }

    _createRelationships(parentFile, associations, fileDictionary) {
        var relationships = { master: atob(parentFile.urn), dependencies: [] };
        
        _.each(associations, function(assoc) {
            // get files from dictionary as they have the URN data
            var currentChild = fileDictionary[assoc.CldFile.Id];
            var currentParent = fileDictionary[assoc.ParFile.Id];
            var current = { file: atob(currentChild.urn), metadata: {} }
            current.metadata.childPath = currentChild.Name;
            current.metadata.parentPath = currentParent.Name;
            relationships.dependencies.push(current);
        });

        return relationships;
    }

    _initFileUpload(count) {
        this._currentJob.filesTotal = count;
        this._currentJob.filesCurrent = 0;
        this._uploadProgress();
    };

    _onFileUpload() {
        this._currentJob.filesCurrent ++;
        this._uploadProgress();
    };

    _uploadProgress() {
        this._currentJob.progress = `Uploading files.. (${this._currentJob.filesCurrent} / ${this._currentJob.filesTotal})`
    };

    _onRenderProgress() {
        if( !this._currentJob.renderStatus.progress ) {
            return;
        }
         if( this._currentJob.renderStatus.progress === 'complete' ) {
            this._currentJob.progress = 'Rendering.. ' + this._currentJob.renderStatus.status;
            this._currentJob.done = true;
            this._setRenderedFile(this._currentJob.file, this._currentJob.urn); 
        }  else {
            this._currentJob.progress = 'Rendering.. ' + this._currentJob.renderStatus.progress;
        }
    }
};