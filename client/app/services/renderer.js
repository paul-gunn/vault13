class Renderer
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
            return new Promise(function(resolve, reject) { // return immediate result in a promise
                resolve(this._currentJob);
            }.bind(this));
        }

        return this._getRenderStatus(this._currentJob.urn)
        .then(function(result) {
            if( result.progress === 'complete' ) {
                this._currentJob.done = true;
                this._setRenderedFile(this._currentJob.file, this._currentJob.urn); 
            }  else {
                this._currentJob.progress = 'Rendering.. ' + result.progress;
            }
            return this._currentJob;
        }.bind(this));
    }

    renderFile(file) {
        this._currentJob = { file: file, done: false, urn: null, progress: 'Uploading files..'  };

        return this._transferFile(file)
        .then(function(urn) {
            this._currentJob.urn = urn;
            return this._renderView(urn);
        }.bind(this));
    }

    _transferFile(file) {
        var that = this;
        return that.VaultAPI.DocService.GetDownloadTickets([file])
        .then(function(results) {
            console.log(results);
            return that.VaultAPI.FilestoreService.DownloadFile(file);
        })
        .then(function(base64data) {
            return that.ForgeAPI.uploadFile(file, base64data);
        })
        .then(function(result) {
            return result.urn;
        });
    };

    _getRenderStatus(urn) {
        return this.ForgeAPI.getViewStatus(urn)
        .then( function(result) {
            console.log('awaiting render')
            console.log(result.progress);
            return result;
        });
    };

    _renderView(urn) {
        return this.ForgeAPI.registerView(urn);
    };

};