var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'pokemon');

var grama_fundo;
var player;
var direcionais;
var botao_voltar;

//particulas
var flash_pokemon;
var sangue_ash;

var grupo_pikachus;
var mochila;
var tempoDisparo = 0;
var botaoDisparo;
var botaoStart;
var explosao;
var musica;
var pikachu;
var count_pikachus = 0;
var balas_pikachu;
var bala_pikachu;
var pikachus_vivos = [];
var tempo_pikachu = 1000;

var texto_win;
var texto_lose;

var jogando;

var jogo = {


	preload: function(){

		game.load.audio('musica', 'audio/tema.ogg');
		game.load.image('grama', 'img/grama.png');
		game.load.image('pokebola', 'img/pokebola.png');
		game.load.image('bala_pikachu', 'img/bala_pokemon.png');
		game.load.image('pikachu', 'img/pikachu.png');
		game.load.image('flash', 'img/particula.png');
		game.load.image('sangue', 'img/sangue_ash.png');
		game.load.spritesheet('explosao', 'img/explosaun.png', 128, 128);
		game.load.spritesheet('pikachu', 'img/pikachu.png', 64,64);
		game.load.spritesheet('ash_player', 'img/ash.png', 17, 20);
		
	},
	create: function(){

		jogando = true;
		count_pikachus = 45;
		game.input.mouse.capture = true;

		game.physics.startSystem(Phaser.Physics.ARCADE);
		musica = game.add.audio('musica');
		musica.loop = true;

		musica.play();

		grama_fundo = game.add.tileSprite(0, 0, 640, 480, 'grama');
		player    = game.add.sprite(400, 400, 'ash_player');
		player.enableBody = true;
		player.physicsBodyType = Phaser.Physics.ARCADE;
		player.body.collideWorldBounds = true;
		player.animations.add('andar', [0,1,0,2], 16, true);
		


		flash_pokemon = game.add.emitter(0, 0, 100);
		flash_pokemon.makeParticles('flash');
    	flash_pokemon.gravity = 0;

    	sangue_ash = game.add.emitter(0, 0, 100);
		sangue_ash.makeParticles('sangue');
    	sangue_ash.gravity = 0;
		player.scale.setTo(3, 3);
		player.anchor.setTo(0.5, 0.5);
		
		game.physics.arcade.enable(player);

		direcionais  = game.input.keyboard.createCursorKeys();
		botaoDisparo = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		botaoStart   = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		balas_pikachu = game.add.group();
	    balas_pikachu.enableBody = true;
	    balas_pikachu.physicsBodyType = Phaser.Physics.ARCADE;
	    balas_pikachu.createMultiple(30, 'bala_pikachu');
	    balas_pikachu.setAll('anchor.x', 0.5);
	    balas_pikachu.setAll('anchor.y', 1);
	    balas_pikachu.setAll('outOfBoundsKill', true);
	    balas_pikachu.setAll('checkWorldBounds', true);

		grupo_pikachus = game.add.group();
		grupo_pikachus.enableBody = true;
		grupo_pikachus.physicsBodyType = Phaser.Physics.ARCADE;

		for(var y = 0 ; y < 5 ; y++)
		{
			for (var x = 0 ; x < 9 ; x++) 
			{
				pikachu = grupo_pikachus.create(x*60, y*40, 'pikachu');
				pikachu.scale.setTo(0.7);
				pikachu.anchor.setTo(0.5);
				pikachu.scale.setTo(2);

			}
		}
		grupo_pikachus.x = 50;
		grupo_pikachus.y = 30;
		
		var style  = { font: "30px Arial", fill: "#ffffff", align: "center"};
	    texto_win  = game.add.text(game.world.centerX, game.world.centerY, "VOCÊ GANHOU!\n\nPRESSIONE ENTER PARA\nJOGAR NOVAMENTE", style);
	    texto_lose = game.add.text(game.world.centerX, game.world.centerY, "VOCÊ PERDEU!\n\nPRESSIONE ENTER PARA\nJOGAR NOVAMENTE", style);
	    texto_win.anchor.setTo(0.5);
	    texto_lose.anchor.setTo(0.5);
	    texto_win.visible = false;
	    texto_lose.visible = false;
	    reloadPokebolas();
		var animacao = game.add.tween(grupo_pikachus).to({x:100}, 3000, Phaser.Easing.Linear.None, true, 0, 3000, true);
		animacao.onLoop.add(descer, this);
	},
	update: function(){

		grama_fundo.tilePosition.y += 2;
		if(direcionais.left.isDown)
		{
			player.x -= 10;
			player.animations.play('andar', true);
		}
		else if(direcionais.right.isDown)
		{
			player.x +=10;
			player.animations.play('andar', true);
		}
		
		if(direcionais.left.isUp && direcionais.right.isUp)
		{
			player.animations.stop('andar', true);
		}
		if (game.time.now > tempo_pikachu)
        {
        	disparopikachu();
        }

		var bala;
		if(botaoDisparo.isDown)
		{
			if(game.time.now > tempoDisparo)
			{
				bala = mochila.getFirstExists(false);
			}
			if(bala && player.alive == true)
			{
				bala.reset(player.x, player.y);
				bala.anchor.setTo(0.1, 0.5);
				bala.scale.setTo(2);
				game.add.tween(bala.scale).to({x:4, y:4}, 1500, Phaser.Easing.Linear.None, true);
				bala.body.velocity.y = -300;
				tempoDisparo = game.time.now + 400;
			}
		}
		
		if(botaoStart.isDown)
		{
			if(!jogando)
			{
				musica.stop();
				game.state.restart();
			}
		}

		game.physics.arcade.overlap(mochila, grupo_pikachus, capturar, null, this);
		game.physics.arcade.overlap(balas_pikachu, player, morte_player, null, this);
	},
};


function morte_player(player,bullet) {
    bullet.kill();
    player.kill();
	sangue_ash.x = player.x;
	sangue_ash.y = player.y;
	jogando = false;
	texto_lose.visible = true;
	sangue_ash.start(true, 1000, null, 600);
	game.add.tween(sangue_ash).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
}

function capturar(pokeball, pokemon)
{
	flash_pokemon.x = pokeball.x;
	flash_pokemon.y = pokeball.y - 30;
	flash_pokemon.start(true, 500, null, 30);
	pokeball.kill();
	pokemon.kill();
	count_pikachus--;
	if(count_pikachus == 0)
	{
		jogando = false;
		player.enableBody = false;
		texto_win.visible = true;
		count_pikachus = 45;
	}
}
	

function descer()
{
	grupo_pikachus.y += 10;
}


function reloadPokebolas()
{
		mochila = game.add.group();
		mochila.enableBody = true;
		mochila.physicsBodyType = Phaser.Physics.ARCADE;
		mochila.createMultiple(200, 'pokebola');
		mochila.setAll('anchor.x', 0);
		mochila.setAll('anchor.y', 4.1);
		mochila.setAll('outOfBoundsKill', true);
		mochila.setAll('checkWorldBounds', true);
}


function disparopikachu () {
    bala_pikachu = balas_pikachu.getFirstExists(false);
    pikachus_vivos.length=0;
    grupo_pikachus.forEachAlive(function(pikachu){
        pikachus_vivos.push(pikachu);
    });
    if (bala_pikachu && pikachus_vivos.length > 0)
    {
        var random=game.rnd.integerInRange(0,pikachus_vivos.length-1);
        var pikachu_atirador = pikachus_vivos[random];
        bala_pikachu.reset(pikachu_atirador.body.x+10, pikachu_atirador.body.y+15);
        bala_pikachu.scale.setTo(1.3,1.3);
        game.physics.arcade.moveToObject(bala_pikachu,player,120);
        tempo_pikachu = game.time.now + 2000;
    }
}

game.state.add('jogo', jogo);
game.state.start('jogo');
