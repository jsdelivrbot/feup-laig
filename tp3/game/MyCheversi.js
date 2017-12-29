MyCheversi.difficulty = {
    EASY: 0,
    MEDIUM: 1,
};

MyCheversi.mode = {
    SINGLEPLAYER: 0,
    MULTIPLAYER: 1,
    NOPLAYER: 2,
};

MyCheversi.player = {
    WHITE: 0,
    BLACK: 1,
};

MyCheversi.turnState = {
    NONE: 0,
    USER_TURN: 1,
    AI_TURN: 2,
    GAME_OVER: 3
}

MyCheversi.MOVE_DELAY = 2500;

function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.match = null;
    this.turnState = MyCheversi.turnState.NONE;

    this.client = new MyClient(8081);

    this.difficulty = null;
    this.mode = null;
    this.userPlayer = null;
    this.AIPlayer = null;

    this.parseGameObject = (data) => {
        let dataArr = JSON.parse(data.target.response);
        let obj = {};

        obj.raw = data.target.response;
        obj.board = dataArr[0];
        obj.currentPlayer = dataArr[1];
        obj.turnCounter = dataArr[2];

        // Not sure if we'll need these
        obj.whiteAttacked = dataArr[3];
        obj.blackAttacked = dataArr[4];

        // only useful for single player
        obj.AIPlayer = dataArr[5];

        obj.movesList = dataArr[6];

        // maybe use these to improve UX when user needs to choose queen?
        obj.whiteNeedsQueen = dataArr[7];
        obj.blackNeedsQueen = dataArr[8];

        obj.isOver = dataArr[9];
        obj.mode = dataArr[10];
        obj.difficulty = dataArr[11];

        this.marker.resetTurnTime();

        console.log(obj);
        this.match = obj;
    }

    this.makeMoveAI = () => {
        let request = 'makeMoveAI(' + this.match.raw + ')';

        this.client.makeRequest(request, (data) => {
            this.parseGameObject(data);
            // at this point, match data is updated

            //get move made by AI by accessing movesList
            let madeMove = this.match.movesList[0];

            //madeMove is an array with format [Player, Piece, X, Y]
            this.getPieceFromInternalRepresentation(madeMove[1], function(a){return a === null;}).setTile(this.getTileFromCoordinates(madeMove[2], madeMove[3]));

            //uncoment once movepiece is implemented (not tested)
            this.updateMatch();
        })
    }

    this.createBoardMarker();
    this.createMaterialsShaders();
    this.createPieces();

    this.registerForPickID = 1;
}

MyCheversi.prototype = Object.create(CGFobject.prototype);
MyCheversi.prototype.constructor = MyCheversi;

MyCheversi.prototype.getPieceFromInternalRepresentation = function(index, comparisonFunc) {
    let firstPieceIndex;
    switch(index) {
        case 1:
        case 2:
            return this.pieces[index-1];
        case 3:
        case 4:
        case 5:
            firstPieceIndex = 2*index-4;
            break;
        case 6:
        case 7:
            return this.pieces[index+2];
        case 8:
        case 9:
        case 10:
            firstPieceIndex = 2*index-6;
            break;
    }

    if(comparisonFunc(this.pieces[firstPieceIndex].tile))
        return this.pieces[firstPieceIndex];
    return this.pieces[firstPieceIndex+1];
}

MyCheversi.prototype.getTileFromCoordinates = function(x,y) {
    return this.board.tiles[8*x+y];
}

MyCheversi.prototype.createBoardMarker = function() {
    this.board = new MyBoard(this);
    this.marker = new MyMarker(this);
}

MyCheversi.prototype.createMaterialsShaders = function() {
    this.shaders = {
        selected: new CGFshader(this.scene.gl, "shaders/selectedVertexShader.glsl", "shaders/selectedFragmentShader.glsl"),
        transparent: new CGFshader(this.scene.gl, "shaders/transparentVertexShader.glsl", "shaders/transparentFragmentShader.glsl"),
        highlighted: new CGFshader(this.scene.gl, "shaders/highlightedVertexShader.glsl", "shaders/highlightedFragmentShader.glsl"),
        default: this.scene.defaultShader
    };

    let blackMaterial = new CGFappearance(this.scene);
    blackMaterial.setAmbient(0.05, 0.05, 0.05, 1);
    blackMaterial.setSpecular(0.9, 0.9, 0.9, 1);
    blackMaterial.setDiffuse(0.1, 0.1, 0.1, 1);

    let whiteMaterial = new CGFappearance(this.scene);
    whiteMaterial.setAmbient(0.05, 0.05, 0.05, 1);
    whiteMaterial.setSpecular(0.3, 0.3, 0.3, 1);
    whiteMaterial.setDiffuse(0.8, 0.8, 0.8, 1);

    this.materials = {'black': blackMaterial, 'white': whiteMaterial};
}

MyCheversi.prototype.createPieces = function() {
    this.pieces = [
    //White pieces
    new MyKing(this, 'white', '1', [15, 0, -8.75], 'objs/king.obj'),
    new MyQueen(this, 'white', '2', [15, 0, -6.25], 'objs/queen.obj'),
    new MyRook(this, 'white', '3', [15, 0, -3.75], 'objs/rook.obj'),
    new MyRook(this, 'white', '3', [15, 0, -1.25], 'objs/rook.obj'),
    new MyBishop(this, 'white', '4', [15, 0, 1.25], 'objs/bishop.obj'),
    new MyBishop(this, 'white', '4', [15, 0, 3.75], 'objs/bishop.obj'),
    new MyKnight(this, 'white', '5', [15, 0, 6.25], 'objs/knight.obj'),
    new MyKnight(this, 'white', '5', [15, 0, 8.75], 'objs/knight.obj'),
    //Black pieces
    new MyKing(this, 'black', '6', [-15, 0, -8.75], 'objs/king.obj'),
    new MyQueen(this, 'black', '7', [-15, 0, -6.25], 'objs/queen.obj'),
    new MyRook(this, 'black', '8', [-15, 0, -3.75], 'objs/rook.obj'),
    new MyRook(this, 'black', '8', [-15, 0, -1.25], 'objs/rook.obj'),
    new MyBishop(this, 'black', '9', [-15, 0, 1.25], 'objs/bishop.obj'),
    new MyBishop(this, 'black', '9', [-15, 0, 3.75], 'objs/bishop.obj'),
    new MyKnight(this, 'black', '10', [-15, 0, 6.25], 'objs/knight.obj'),
    new MyKnight(this, 'black', '10', [-15, 0, 8.75], 'objs/knight.obj')
     ];
    this.selectedPiece = null;
}

MyCheversi.prototype.pickPiece = function(piece) {
    // not user's turn
    if(this.turnState != MyCheversi.turnState.USER_TURN)
        return;

    //Piece already played
    if(piece.tile !== null)
        return;

    //Piece in mid air (let it land!)
    if(piece.animation !== null)
        return;

    //Unselect previous piece, if necessary
    if(this.selectedPiece !== null)
        this.selectedPiece.selected = false;

    this.selectedPiece = piece;
    piece.selected = true;
}

/**
 * Starts new match based on user input's data
 * @param mode
 * @param difficulty
 * @param player
 */
 MyCheversi.prototype.startGame = function(mode, player, difficulty) {
    let request = 'initGame(';
    switch(mode) {
        case MyCheversi.mode.SINGLEPLAYER:
            request+= 'singlePlayer,';
            break;
        case MyCheversi.mode.MULTIPLAYER:
            request+= 'multiPlayer,';
            break;
        case MyCheversi.mode.NOPLAYER:
            request+= 'noPlayer,';
            break;
    }

    switch(player) {
        case MyCheversi.player.WHITE: request+= 'white,'; break;
        case MyCheversi.player.BLACK: request+= 'black,'; break;
    }

    switch(difficulty) {
        case MyCheversi.difficulty.EASY: request+= 'easy)'; break;
        case MyCheversi.difficulty.MEDIUM: request+= 'medium)'; break;
    }

    this.client.makeRequest(request, (data) => {
        this.parseGameObject(data);

        //at this point, match data is updated
        this.mode = mode;
        this.difficulty = difficulty;
        this.userPlayer = player;

        // set initial turnState
        if((this.mode == MyCheversi.mode.SINGLEPLAYER && this.userPlayer == MyCheversi.player.BLACK)
         || this.mode == MyCheversi.mode.NOPLAYER) {
            this.turnState = MyCheversi.turnState.AI_TURN;
            setTimeout(this.makeMoveAI, MyCheversi.MOVE_DELAY);
        }
        else
            this.turnState = MyCheversi.turnState.USER_TURN;

        this.resetStatus();

        alertify.success('Game started!');
    });
}

/**
 * Checks if move is valid and executes it if true bu calling movePiece
 * @param tile
 */
MyCheversi.prototype.makeMove = function(tile) {
    if(this.selectedPiece === null) //No piece to make a move
        return;
    if(tile.piece !== null) //Tile already occupied
        return;

    let request = 'checkMove(' + this.match.raw + ',' + this.selectedPiece.representation + ',' + (tile.row-1) + ',' + (tile.col-1) + ')';

    this.client.makeRequest(request, (data) => {
        let validMove = JSON.parse(data.target.response);
        console.log(validMove);
        if(validMove)
           this.movePiece(tile);
        else
            alertify.error('Invalid move!');
    });
}

MyCheversi.prototype.movePiece = function(tile) {
    let request = 'makeMove(' + this.match.raw + ',' + this.selectedPiece.representation + ',' + (tile.row-1) + ',' + (tile.col-1) + ')';

    this.client.makeRequest(request, (data) => {
        this.parseGameObject(data);

        // prepare for next turn
        this.updateMatch();

        this.selectedPiece.selected = false;
        this.selectedPiece.setTile(tile);
        this.selectedPiece = null;
    });
}

MyCheversi.prototype.updateMatch = function() {
    // Check game over
    if(this.match.isOver) {
        this.matchOver(false);
        return;
    }

    // Update match state
    this.updateTurnState();

    //At this point, turn info is updated
    if(this.turnState == MyCheversi.turnState.AI_TURN)
        setTimeout(this.makeMoveAI, MyCheversi.MOVE_DELAY);

    // Update score on marker
    this.marker.updateScore(this.match.whiteAttacked, this.match.blackAttacked);

    // Update highlighted tiles
    if(this.match.currentPlayer == MyCheversi.player.WHITE)
        this.board.highlightTiles(this.match.blackAttacked);
    else
        this.board.highlightTiles(this.match.whiteAttacked);
}

MyCheversi.prototype.updateTurnState = function() {
    switch(this.mode) {
        case MyCheversi.mode.MULTIPLAYER:
            this.turnState = MyCheversi.turnState.USER_TURN;
            break;
        case MyCheversi.mode.SINGLEPLAYER:
            if(this.match.currentPlayer == this.userPlayer)
                this.turnState = MyCheversi.turnState.USER_TURN;
            else
                this.turnState = MyCheversi.turnState.AI_TURN;
            break;
        case MyCheversi.mode.NOPLAYER:
            this.turnState = MyCheversi.turnState.AI_TURN;
            break;
    }
}

MyCheversi.prototype.undoMove = function() {
    if(this.match.turnState == MyCheversi.turnState.NONE || this.match.turnState == MyCheversi.turnState.GAME_OVER ||
        this.mode == MyCheversi.mode.NOPLAYER ||
        (this.match.turnState == MyCheversi.turnState.AI_TURN && this.mode == MyCheversi.mode.SINGLEPLAYER))
        return;

    let request = 'undoMove(' + this.match.raw + ')';

    this.client.makeRequest(request, (data) => {
        let previousObject = Object.assign({}, this.match);
        this.parseGameObject(data);

        let length1 = previousObject.movesList.length;
        let length2 = this.match.movesList.length;

        // get moves to be retracted
        let removedMoves = previousObject.movesList.slice(0, length1-length2);

        for(let i = 0; i < removedMoves.length; i++)
            this.getPieceFromInternalRepresentation(removedMoves[i][1], function(a){return a !== null;}).retractPiece();

        this.marker.updateScore(this.match.whiteAttacked, this.match.blackAttacked);
        // Update highlighted tiles
        if(this.match.currentPlayer == MyCheversi.player.WHITE)
            this.board.highlightTiles(this.match.blackAttacked);
        else
            this.board.highlightTiles(this.match.whiteAttacked);

        alertify.success('Last turn undone!');
    });
}

MyCheversi.prototype.matchOver = function(dueToTurnTime) {
    this.turnState = MyCheversi.turnState.GAME_OVER;

    // Update score on marker
    this.marker.updateScore(this.match.whiteAttacked, this.match.blackAttacked);

    // Reset highlighted tiles
    this.board.resetHighlighted();

    // Show game over notofication
    let msg;
    if((dueToTurnTime && this.match.currentPlayer == MyCheversi.player.WHITE) ||
        (!dueToTurnTime && this.marker.scores.black > this.marker.scores.white))
        msg = "<h3><strong>Black wins!</strong></h3>";
    else
        msg = "<h3><strong>White wins!</strong></h3>";
    msg += "<p>Final score: White "+this.marker.scores.white+" - "+this.marker.scores.black+" Black</p>";
    alertify.delay(MyCheversi.MOVE_DELAY*2).log(msg);
}

MyCheversi.prototype.watchMovie = function() {
    if(this.turnState !== MyCheversi.turnState.GAME_OVER)
        return;

    this.resetStatus();

    let nMoves = this.match.movesList.length;
    for(let i = nMoves-1; i >= 0; i--) {
        let currentMove = this.match.movesList[i];
        let currentPiece = this.getPieceFromInternalRepresentation(currentMove[1], function(a){return a === null;});
        let currentTile = this.getTileFromCoordinates(currentMove[2], currentMove[3]);

        // Need to update tile-piece bidirectional reference here because setTile is called asynchronously
        currentTile.piece = currentPiece;
        currentPiece.tile = currentTile;
        setTimeout(() => {currentPiece.setTile(currentTile);}, (nMoves-i)*MyCheversi.MOVE_DELAY);
    }
}

MyCheversi.prototype.resetStatus = function() {
    this.marker.resetStatus();
    this.board.resetStatus();
    for(let id in this.pieces)
        this.pieces[id].resetStatus();
    this.selectedPiece = null;
}

MyCheversi.prototype.updateVisuals = function(visuals) {
    this.board.updateTexture(visuals.boardtexture);
    this.marker.updateTexture(visuals.markertexture);
    this.materials.white = visuals.whitematerial;
    this.materials.black = visuals.blackmaterial;
}

MyCheversi.prototype.display = function() {
    //Reset pick ID
    this.registerForPickID = 1;

    this.scene.pushMatrix();

    this.marker.display();
    this.board.display();
    for(let id in this.pieces)
        this.pieces[id].display();

    this.scene.popMatrix();
}
