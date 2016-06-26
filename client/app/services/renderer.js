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
        if( !this._currentJob.done && this._currentJob.urn ) {
            return this._getRenderStatus(this._currentJob.urn)
            .then(function(isRendered) {
                if( isRendered ) {
                    this._currentJob.done = true;
                    this._setRenderedFile(this._currentJob.file, this._currentJob.urn); 
                }
                return this._currentJob;
            }.bind(this));
        }
        
        return this._currentJob;
    }

    renderFile(file) {
        this._currentJob = { file: file, done: false, urn: null  };

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
            return result.progress === 'complete';
        });
    };

    _renderView(urn) {
        return this.ForgeAPI.registerView(urn);
    };

};