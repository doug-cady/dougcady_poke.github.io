function getKOChanceText(damage, attacker, defender, field, move, hits, isBadDreams) {
    if (isNaN(damage[0])) {
        return 'something broke; please tell Austin';
    }
    if (damage[damage.length - 1] === 0) {
        if (field.weather === "Harsh Sun" && move.type === "Water") {
            return "the Water-Type attack evaporated in the harsh sunlight";
        } else if (field.weather === "Heavy Rain" && move.type === "Fire") {
            return "the Fire-Type attack fizzled out in the heavy rain";
        }
        return 'aim for the horn next time';
    }
    if (damage[0] >= defender.maxHP && (move.usedTimes === 1 && move.metronomeCount === 1)) {
        return 'guaranteed OHKO';
    }
    var hasSitrus = defender.item === "Sitrus Berry";
    var hasFigy = defender.item === "Figy Berry";
    var hasIapapa = defender.item === "Iapapa Berry";
    var hasWiki = defender.item === "Wiki Berry";
    var hasAguav = defender.item === "Aguav Berry";
    var hasMago = defender.item === "Mago Berry";
    var gluttony = defender.ability === "Gluttony";
    if ((damage.length !== 256 || !hasSitrus && !hasFigy && !hasIapapa && !hasWiki && !hasAguav && !hasMago) && damage[0] >= defender.curHP) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasSitrus && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 4)) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasFigy && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 2)) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasIapapa && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 2)) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasWiki && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 2)) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasAguav && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 2)) {
        return "guaranteed OHKO";
    } else if (damage.length === 256 && hasMago && damage[0] >= defender.curHP + Math.floor(defender.maxHP / 2)) {
        return "guaranteed OHKO";
    }

    var hazards = 0;
    var hazardText = [];
    if (field.isSR && ['Magic Guard', 'Mountaineer'].indexOf(defender.ability) === -1) {
        var effectiveness = typeChart['Rock'][defender.type1] * (defender.type2 ? typeChart['Rock'][defender.type2] : 1);
        hazards += Math.floor(effectiveness * defender.maxHP / 8);
        hazardText.push('Stealth Rock');
    }
    if (!defender.hasType('Flying') &&
        ['Magic Guard', 'Levitate'].indexOf(defender.ability) === -1 && defender.item !== 'Air Balloon') {
        if (field.spikes === 1) {
            hazards += Math.floor(defender.maxHP / 8);
            if (gen === 2) {
                hazardText.push('Spikes');
            } else {
                hazardText.push('1 layer of Spikes');
            }
        } else if (field.spikes === 2) {
            hazards += Math.floor(defender.maxHP / 6);
            hazardText.push('2 layers of Spikes');
        } else if (field.spikes === 3) {
            hazards += Math.floor(defender.maxHP / 4);
            hazardText.push('3 layers of Spikes');
        }
    }
    if (isNaN(hazards)) {
        hazards = 0;
    }

    var eot = 0;
    var eotText = [];
    if (field.weather === 'Sun' || field.weather === "Harsh Sunshine") {
        if (defender.ability === 'Dry Skin' || defender.ability === 'Solar Power') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push(defender.ability + ' damage');
        }
    } else if (field.weather.indexOf("Rain") !== -1) {
        if (defender.ability === 'Dry Skin') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Dry Skin recovery');
        } else if (defender.ability === 'Rain Dish') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Rain Dish recovery');
        }
    } else if (field.weather === 'Sand') {
        if (['Rock', 'Ground', 'Steel'].indexOf(defender.type1) === -1 &&
                ['Rock', 'Ground', 'Steel'].indexOf(defender.type2) === -1 &&
                ['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].indexOf(defender.ability) === -1 &&
                defender.item !== 'Safety Goggles') {
            eot -= Math.floor(defender.maxHP / 16);
            eotText.push('sandstorm damage');
        }
    } else if (field.weather === 'Hail') {
        if (defender.ability === 'Ice Body') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Ice Body recovery');
        } else if (defender.type1 !== 'Ice' && defender.type2 !== 'Ice' &&
                ['Magic Guard', 'Overcoat', 'Snow Cloak'].indexOf(defender.ability) === -1 &&
                defender.item !== 'Safety Goggles') {
            eot -= Math.floor(defender.maxHP / 16);
            eotText.push('hail damage');
        }
    }
    var loseItem = move.name === "Knock Off" && defender.ability !== 'Sticky Hold';
    if (defender.item === 'Leftovers' && !loseItem) {
        eot += Math.floor(defender.maxHP / 16);
        eotText.push('Leftovers recovery');
    } else if (defender.item === 'Black Sludge' && !loseItem) {
        if (defender.type1 === 'Poison' || defender.type2 === 'Poison') {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Black Sludge recovery');
        } else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push('Black Sludge damage');
        }
    } else if (defender.item === 'Sticky Barb') {
        eot -= Math.floor(defender.maxHP / 8);
        eotText.push('Sticky Barb damage');
    }
    if (field.isDefenderSeeded) {
        if (defender.ability !== 'Magic Guard') {
            eot -= gen >= 2 ? Math.floor(defender.maxHP / 8) : Math.floor(defender.maxHP / 16); // 1/16 in gen 1, 1/8 in gen 2 onwards
            eotText.push('Leech Seed damage');
        }
    }
    if (field.isAttackerSeeded && attacker.ability !== "Magic Guard") {
        if (attacker.ability === "Liquid Ooze") {
            eot -= gen >= 2 ? Math.floor(attacker.maxHP / 8) : Math.floor(attacker.maxHP / 16);
            eotText.push("Liquid Ooze damage");
        } else {
            eot += gen >= 2 ? Math.floor(attacker.maxHP / 8) : Math.floor(attacker.maxHP / 16);
            eotText.push("Leech Seed recovery");
        }
    }
    if (field.terrain === "Grassy") {
        if (isGroundedForCalc(defender, field)) {
            eot += Math.floor(defender.maxHP / 16);
            eotText.push('Grassy Terrain recovery');
        }
    }
    var toxicCounter = 0;
    if (defender.status === 'Poisoned') {
        if (defender.ability === 'Poison Heal') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Poison Heal');
        } else if (defender.ability !== 'Magic Guard') {
            eot -= Math.floor(defender.maxHP / 8);
            eotText.push('poison damage');
        }
    } else if (defender.status === 'Badly Poisoned') {
        if (defender.ability === 'Poison Heal') {
            eot += Math.floor(defender.maxHP / 8);
            eotText.push('Poison Heal');
        } else if (defender.ability !== 'Magic Guard') {
            eotText.push('toxic damage');
            toxicCounter = defender.toxicCounter;
        }
    } else if (defender.status === 'Burned') {
        if (defender.ability === 'Heatproof') {
            eot -= gen > 6 ? Math.floor(defender.maxHP / 32) : Math.floor(defender.maxHP / 16);
            eotText.push('reduced burn damage');
        } else if (defender.ability !== 'Magic Guard') {
            eot -= gen > 6 ? Math.floor(defender.maxHP / 16) : Math.floor(defender.maxHP / 8);
            eotText.push('burn damage');
        }
    } else if ((defender.status === 'Asleep' || defender.ability === 'Comatose') && isBadDreams && defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxHP / 8);
        eotText.push('Bad Dreams');
    }
    if (['Bind', 'Clamp', 'Fire Spin', 'Infestation', 'Magma Storm', 'Sand Tomb', 'Whirlpool', 'Wrap'].indexOf(move.name) !== -1 && defender.ability !== 'Magic Guard') {
        if (attacker.item === "Binding Band") {
            eot -= gen > 5 ? Math.floor(defender.maxHP / 6) : Math.floor(defender.maxHP / 8);
            eotText.push('trapping damage');
        } else {
            eot -= gen > 5 ? Math.floor(defender.maxHP / 8) : Math.floor(defender.maxHP / 16);
            eotText.push('trapping damage');
        }
    }
    if ((move.name === 'Fire Pledge (Grass Pledge Boosted)' || move.name === 'Grass Pledge (Fire Pledge Boosted)') && [defender.type1, defender.type2].indexOf("Fire") === -1 && defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxHP / 8);
        eotText.push('Sea of Fire damage');
    }
    // multi-hit moves have too many possibilities for brute-forcing to work, so reduce it to an approximate distribution
    var qualifier = '';
    if (hits > 1) {
        qualifier = 'approx. ';
        damage = squashMultihit(damage, hits);
    }
        var multihit = damage.length === 256 || move.hits > 1;
    var c = getKOChance(damage, multihit, defender.curHP - hazards, 0, 1, defender.maxHP, toxicCounter, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony);
    var afterText = hazardText.length > 0 ? " after " + serializeText(hazardText) : "";
    if (c === 1) {
        return "guaranteed OHKO" + afterText;
    } else if (c > 0) {
        return qualifier + Math.round(c * 1000) / 10 + "% chance to OHKO" + afterText;
    }

    if (hasSitrus && move.name !== "Knock Off") {
        eotText.push("Sitrus Berry recovery");
    }

    if (hasFigy && move.name !== "Knock Off") {
        if (gluttony) eotText.push("Gluttony Figy Berry recovery");
        else eotText.push("Figy Berry recovery");

    }

    if (hasIapapa && move.name !== "Knock Off") {
        if (gluttony) eotText.push("Gluttony Iapapa Berry recovery");
        else eotText.push("Iapapa Berry recovery");

    }

    if (hasWiki && move.name !== "Knock Off") {
        if (gluttony) eotText.push("Gluttony Wiki Berry recovery");
        else eotText.push("Wiki Berry recovery");

    }

    if (hasAguav && move.name !== "Knock Off") {
        if (gluttony) eotText.push("Gluttony Aguav Berry recovery");
        else eotText.push("Aguav Berry recovery");

    }

    if (hasMago && move.name !== "Knock Off") {
        if (gluttony) eotText.push("Gluttony Mago Berry recovery");
        else eotText.push("Mago Berry recovery");
    }
    afterText = hazardText.length > 0 || eotText.length > 0 ? " after " + serializeText(hazardText.concat(eotText)) : "";
    var i;
    for (i = 2; i <= 4; i++) {
        c = getKOChance(damage, multihit, defender.curHP - hazards, eot, i, defender.maxHP, toxicCounter, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony);
        if (c === 1) {
            return "guaranteed " + i + "HKO" + afterText;
        } else if (c > 0) {
            var pct = Math.round(c * 1000) / 10;
            var chance = pct ? qualifier + pct + "%" : "Miniscule";
            return chance + " chance to " + i + "HKO" + afterText;
        }
    }

    for (i = 5; i <= 9; i++) {
        if (predictTotal(damage[0], eot, i, toxicCounter, defender.curHP - hazards, defender.maxHP, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) >= defender.curHP - hazards) {
            return "guaranteed " + i + "HKO" + afterText;
        } else if (predictTotal(damage[damage.length - 1], eot, i, toxicCounter, defender.curHP - hazards, defender.maxHP, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) >= defender.curHP - hazards) {
            return "possible " + i + "HKO" + afterText;
        }
    }

    return "nice chip damage";
}

function getKOChance(damage, multihit, hp, eot, hits, maxHP, toxicCounter, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) {
    var n = damage.length;
    var minDamage = damage[0];
    var maxDamage = damage[n - 1];
    var i;
    if (hits === 1) {
        if ((!multihit || !hasSitrus) && maxDamage < hp) {
            return 0;
        } else if (multihit && hasSitrus && maxDamage < hp + Math.floor(maxHP / 4)) {
            return 0;
        } else if (multihit && hasFigy && maxDamage < hp + Math.floor(maxHP / 2)) {
            return 0;
        } else if (multihit && hasIapapa && maxDamage < hp + Math.floor(maxHP / 2)) {
            return 0;
        } else if (multihit && hasWiki && maxDamage < hp + Math.floor(maxHP / 2)) {
            return 0;
        } else if (multihit && hasAguav && maxDamage < hp + Math.floor(maxHP / 2)) {
            return 0;
        } else if (multihit && hasMago && maxDamage < hp + Math.floor(maxHP / 2)) {
            return 0;
        }
        for (i = 0; i < n; i++) {
            if ((!multihit || !hasSitrus && !hasFigy && !hasIapapa && !hasWiki && !hasAguav && !hasMago) && damage[i] >= hp) {
                return (n - i) / n;
            } else if (multihit && hasSitrus && damage[i] >= hp + Math.floor(maxHP / 4)) {
                return (n - i) / n;
            } else if (multihit && hasFigy && damage[i] >= hp + Math.floor(maxHP / 2)) {
                return (n - i) / n;
            } else if (multihit && hasIapapa && damage[i] >= hp + Math.floor(maxHP / 2)) {
                return (n - i) / n;
            } else if (multihit && hasWiki && damage[i] >= hp + Math.floor(maxHP / 2)) {
                return (n - i) / n;
            } else if (multihit && hasAguav && damage[i] >= hp + Math.floor(maxHP / 2)) {
                return (n - i) / n;
            } else if (multihit && hasMago && damage[i] >= hp + Math.floor(maxHP / 2)) {
                return (n - i) / n;
            }
        }
    }
    /*
    if (predictTotal(maxDamage, eot, hits, toxicCounter, hp, maxHP, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) < hp) {
        return 0;
    } else if (predictTotal(minDamage, eot, hits, toxicCounter, hp, maxHP, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) >= hp) {
        return 1;
    }*/
    var toxicDamage = 0;
    if (toxicCounter > 0) {
        toxicDamage = Math.floor(toxicCounter * maxHP / 16);
        toxicCounter++;
    }
    var sum = 0;
    var lastC = 0;
    for (i = 0; i < n; i++) {
        if (hp - damage[i] <= maxHP / 2 && hasSitrus) {
            hp += Math.floor(maxHP / 4);
            hasSitrus = false;
        } else if (hp - damage[i] <= maxHP / 4 && hasFigy && !gluttony || hp - damage[i] <= maxHP / 2 && hasFigy && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasFigy = false;
        } else if (hp - damage[i] <= maxHP / 4 && hasIapapa && !gluttony || hp - damage[i] <= maxHP / 2 && hasIapapa && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasIapapa = false;
        } else if (hp - damage[i] <= maxHP / 4 && hasWiki && !gluttony || hp - damage[i] <= maxHP / 2 && hasWiki && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasWiki = false;
        } else if (hp - damage[i] <= maxHP / 4 && hasAguav && !gluttony || hp - damage[i] <= maxHP / 2 && hasAguav && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasAguav = false;
        } else if (hp - damage[i] <= maxHP / 4 && hasMago && !gluttony || hp - damage[i] <= maxHP / 2 && hasMago && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasMago = false;
        }
        var c;
        if (i === 0 || damage[i] !== damage[i - 1]) {
            c = getKOChance(damage, multihit, hp - damage[i] + eot - toxicDamage, eot, hits - 1, maxHP, toxicCounter, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony);
        } else {
            c = lastC;
        }
        if (c === 1) {
            sum += n - i;
            break;
        } else {
            sum += c;
        }
        lastC = c;
    }
    return sum / n;
}

function predictTotal(damage, eot, hits, toxicCounter, hp, maxHP, hasSitrus, hasFigy, hasIapapa, hasWiki, hasAguav, hasMago, gluttony) {
    var total = 0;
    for (var i = 0; i < hits; i++) {
        total += damage;
        if (hp - total <= maxHP / 2 && hasSitrus) {
            total -= Math.floor(maxHP / 4);
            hasSitrus = false;
        } else if (hp - total <= maxHP / 4 && hasFigy && !gluttony || hp - total <= maxHP / 2 && hasFigy && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasFigy = false;
        } else if (hp - total <= maxHP / 4 && hasIapapa && !gluttony || hp - total <= maxHP / 2 && hasIapapa && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasIapapa = false;
        } else if (hp - total <= maxHP / 4 && hasWiki && !gluttony || hp - total <= maxHP / 2 && hasWiki && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasWiki = false;
        } else if (hp - total <= maxHP / 4 && hasAguav && !gluttony || hp - total <= maxHP / 2 && hasAguav && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasAguav = false;
        } else if (hp - total <= maxHP / 4 && hasMago && !gluttony || hp - total <= maxHP / 2 && hasMago && gluttony) {
            hp += Math.floor(maxHP / 2);
            hasMago = false;
        }
        if (i < hits - 1) {
            total -= eot;
            if (toxicCounter > 0) {
                total += Math.floor((toxicCounter + i) * maxHP / 16);
            }
        }
    }
    return total;
}

function squashMultihit(d, hits) {
    if (d.length === 1) {
        return [d[0] * hits];
    } else if (gen === 1) {
        var r = [];
        for (var i = 0; i < d.length; i++) {
            r[i] = d[i] * hits;
        }
        return r;
    } else if (d.length === 16) {
        switch (hits) {
        case 2:
            return [
                2 * d[0], d[2] + d[3], d[4] + d[4], d[4] + d[5],
                d[5] + d[6], d[6] + d[6], d[6] + d[7], d[7] + d[7],
                d[8] + d[8], d[8] + d[9], d[9] + d[9], d[9] + d[10],
                d[10] + d[11], d[11] + d[11], d[12] + d[13], 2 * d[15]
            ];
        case 3:
            return [
                3 * d[0], d[3] + d[3] + d[4], d[4] + d[4] + d[5], d[5] + d[5] + d[6],
                d[5] + d[6] + d[6], d[6] + d[6] + d[7], d[6] + d[7] + d[7], d[7] + d[7] + d[8],
                d[7] + d[8] + d[8], d[8] + d[8] + d[9], d[8] + d[9] + d[9], d[9] + d[9] + d[10],
                d[9] + d[10] + d[10], d[10] + d[11] + d[11], d[11] + d[12] + d[12], 3 * d[15]
            ];
        case 4:
            return [
                4 * d[0], 4 * d[4], d[4] + d[5] + d[5] + d[5], d[5] + d[5] + d[6] + d[6],
                4 * d[6], d[6] + d[6] + d[7] + d[7], 4 * d[7], d[7] + d[7] + d[7] + d[8],
                d[7] + d[8] + d[8] + d[8], 4 * d[8], d[8] + d[8] + d[9] + d[9], 4 * d[9],
                d[9] + d[9] + d[10] + d[10], d[10] + d[10] + d[10] + d[11], 4 * d[11], 4 * d[15]
            ];
        case 5:
            return [
                5 * d[0], d[4] + d[4] + d[4] + d[5] + d[5], d[5] + d[5] + d[5] + d[5] + d[6], d[5] + d[6] + d[6] + d[6] + d[6],
                d[6] + d[6] + d[6] + d[6] + d[7], d[6] + d[6] + d[7] + d[7] + d[7], 5 * d[7], d[7] + d[7] + d[7] + d[8] + d[8],
                d[7] + d[7] + d[8] + d[8] + d[8], 5 * d[8], d[8] + d[8] + d[8] + d[9] + d[9], d[8] + d[9] + d[9] + d[9] + d[9],
                d[9] + d[9] + d[9] + d[9] + d[10], d[9] + d[10] + d[10] + d[10] + d[10], d[10] + d[10] + d[11] + d[11] + d[11], 5 * d[15]
            ];
        default:
            console.log("Unexpected # of hits: " + hits);
            return d;
        }
    } else if (d.length === 39) {
        switch (hits) {
        case 2:
            return [
                2 * d[0], 2 * d[7], 2 * d[10], 2 * d[12],
                2 * d[14], d[15] + d[16], 2 * d[17], d[18] + d[19],
                d[19] + d[20], 2 * d[21], d[22] + d[23], 2 * d[24],
                2 * d[26], 2 * d[28], 2 * d[31], 2 * d[38]
            ];
        case 3:
            return [
                3 * d[0], 3 * d[9], 3 * d[12], 3 * d[13],
                3 * d[15], 3 * d[16], 3 * d[17], 3 * d[18],
                3 * d[20], 3 * d[21], 3 * d[22], 3 * d[23],
                3 * d[25], 3 * d[26], 3 * d[29], 3 * d[38]
            ];
        case 4:
            return [
                4 * d[0], 2 * d[10] + 2 * d[11], 4 * d[13], 4 * d[14],
                2 * d[15] + 2 * d[16], 2 * d[16] + 2 * d[17], 2 * d[17] + 2 * d[18], 2 * d[18] + 2 * d[19],
                2 * d[19] + 2 * d[20], 2 * d[20] + 2 * d[21], 2 * d[21] + 2 * d[22], 2 * d[22] + 2 * d[23],
                4 * d[24], 4 * d[25], 2 * d[27] + 2 * d[28], 4 * d[38]
            ];
        case 5:
            return [
                5 * d[0], 5 * d[11], 5 * d[13], 5 * d[15],
                5 * d[16], 5 * d[17], 5 * d[18], 5 * d[19],
                5 * d[19], 5 * d[20], 5 * d[21], 5 * d[22],
                5 * d[23], 5 * d[25], 5 * d[27], 5 * d[38]
            ];
        default:
            console.log("Unexpected # of hits: " + hits);
            return d;
        }
    } else {
        console.log("Unexpected # of possible damage values: " + d.length);
        return d;
    }
}

function serializeText(arr) {
    if (arr.length === 0) {
        return '';
    } else if (arr.length === 1) {
        return arr[0];
    } else if (arr.length === 2) {
        return arr[0] + " and " + arr[1];
    } else {
        var text = '';
        for (var i = 0; i < arr.length - 1; i++) {
            text += arr[i] + ', ';
        }
        return text + 'and ' + arr[arr.length - 1];
    }
}
