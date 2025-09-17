import { IStorage } from '../../storage';
import { Ship } from '@shared/schema';

export class CombatService {
  constructor(private storage: IStorage) {}

  async simulateBattle(attackerShip: Ship, defenderShip: Ship) {
    const attacker = {
      hull: attackerShip.hull,
      shields: attackerShip.shields,
      attack: attackerShip.attack,
      defense: attackerShip.defense,
      speed: attackerShip.speed,
    };

    const defender = {
      hull: defenderShip.hull,
      shields: defenderShip.shields,
      attack: defenderShip.attack,
      defense: defenderShip.defense,
      speed: defenderShip.speed,
    };

    const battleLog: string[] = [];
    let rounds = 0;
    const maxRounds = 10;

    while (attacker.hull > 0 && defender.hull > 0 && rounds < maxRounds) {
      rounds++;
      
      // Determine who goes first based on speed
      const attackerFirst = attacker.speed >= defender.speed;
      
      if (attackerFirst) {
        this.performAttack(attacker, defender, 'Attacker', battleLog);
        if (defender.hull > 0) {
          this.performAttack(defender, attacker, 'Defender', battleLog);
        }
      } else {
        this.performAttack(defender, attacker, 'Defender', battleLog);
        if (attacker.hull > 0) {
          this.performAttack(attacker, defender, 'Attacker', battleLog);
        }
      }
    }

    const winner = attacker.hull > 0 ? 'attacker' : 'defender';
    const winnerDamage = winner === 'attacker' ? attackerShip.hull - attacker.hull : defenderShip.hull - defender.hull;
    const loserDamage = winner === 'attacker' ? defenderShip.hull - defender.hull : attackerShip.hull - attacker.hull;

    return {
      winner,
      rounds,
      winnerDamage,
      loserDamage,
      battleLog,
      description: this.generateBattleDescription(winner, rounds, battleLog),
      rating: this.calculateBattleRating(attackerShip, defenderShip),
    };
  }

  private performAttack(attacker: any, defender: any, attackerName: string, battleLog: string[]) {
    // Calculate damage
    const baseDamage = attacker.attack;
    const damageVariation = Math.floor(Math.random() * 10) - 5; // ±5 damage variation
    let damage = Math.max(1, baseDamage + damageVariation);

    // Apply defense
    const defense = defender.defense;
    damage = Math.max(1, damage - Math.floor(defense * 0.5));

    // Critical hit chance (10%)
    const criticalHit = Math.random() < 0.1;
    if (criticalHit) {
      damage = Math.floor(damage * 1.5);
      battleLog.push(`💥 ${attackerName} scores a critical hit!`);
    }

    // Apply damage to shields first, then hull
    if (defender.shields > 0) {
      const shieldDamage = Math.min(damage, defender.shields);
      defender.shields -= shieldDamage;
      damage -= shieldDamage;
      
      if (shieldDamage > 0) {
        battleLog.push(`🛡️ ${attackerName} hits shields for ${shieldDamage} damage`);
      }
    }

    if (damage > 0) {
      defender.hull -= damage;
      battleLog.push(`💥 ${attackerName} hits hull for ${damage} damage`);
    }

    // Ensure hull doesn't go below 0
    defender.hull = Math.max(0, defender.hull);
  }

  private generateBattleDescription(winner: string, rounds: number, battleLog: string[]): string {
    const descriptions = [
      `After ${rounds} intense rounds of combat, the ${winner} emerges victorious!`,
      `The battle rages for ${rounds} rounds before the ${winner} claims victory!`,
      `In a ${rounds}-round engagement, the ${winner} proves superior in combat!`,
      `Following ${rounds} rounds of fierce space combat, the ${winner} is triumphant!`,
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private calculateBattleRating(ship1: Ship, ship2: Ship): string {
    const ship1Power = ship1.attack + ship1.defense + ship1.hull + ship1.shields;
    const ship2Power = ship2.attack + ship2.defense + ship2.hull + ship2.shields;
    
    const powerDiff = Math.abs(ship1Power - ship2Power);
    const avgPower = (ship1Power + ship2Power) / 2;
    const balanceRatio = powerDiff / avgPower;

    if (balanceRatio < 0.1) return 'Perfectly Balanced';
    if (balanceRatio < 0.2) return 'Well Matched';
    if (balanceRatio < 0.3) return 'Competitive';
    if (balanceRatio < 0.5) return 'One-Sided';
    return 'Overwhelming';
  }
}
