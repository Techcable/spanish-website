import { diffChars } from 'diff';
import React from 'react';

export function damerau_levenshtein(first, second) {
    // TODO: Support non-BMP characters (like that's ever going to happen)
    if (first == second) return 0;
    var firstLen = first.length;
    var secondLen = second.length;
    if (firstLen == 0) return secondLen;
    if (secondLen == 0) return firstLen;


    var distances = [];
    for (var i = 0; i < firstLen + 2; i++) {
        distances.push(Array(secondLen + 2).fill(0));
    }
    const maxDistance = firstLen + secondLen;
    distances[0][0] = maxDistance;

    for (var i = 0; i < firstLen + 1; i++) {
        distances[i + 1][0] = maxDistance;
        distances[i + 1][1] = i;
    }
    for (var j = 0; j < secondLen + 1; j++) {
        distances[0][j + 1] = maxDistance;
        distances[1][j + 1] = j;
    }

    var chars = new Map();

    for (var i = 1; i < firstLen + 1; i++) {
        var db = 0;
        for (var j = 1; j < secondLen + 1; j++) {
            var k = chars.get(second.charAt(j - 1));
            if (typeof k == 'undefined') {
                k = 0;
            }
            const l = db;
            var cost = 1;
            if (first[i - 1] == second[j - 1]) {
                cost = 0;
                db = j;
            }

            const substitutionCost = distances[i][j] + cost;
            const insertionCost = distances[i][j + 1] + 1;
            const deletionCost = distances[i + 1][j] + 1;
            const transpositionCost = distances[k][l] +
                (i - k -1) + 1 + (j - l - 1);
            distances[i + 1][j + 1] = Math.min(
                substitutionCost,
                insertionCost,
                deletionCost,
                transpositionCost
            );
        }
        chars.set(first[i - 1], i);
    }
    return distances[firstLen + 1][secondLen + 1];
}

// Utils
export function createDiffFragment(original, revised, color_function) {
    const diff = diffChars(original, revised);
    var array = [];

    var i = 0;
    diff.forEach(function(part) {
        var color = color_function(part);
        if (color != null) {
            const span = <span key={i++} style={{color}}>{part.value}</span>;
            array.push(span);
        }
    })

    return array;
}

export function minBy(target_array, func) {
    if (target_array.length < 1) return undefined;
    var smallest_element = target_array[0];
    var smallest_value = func(smallest_element);
    for (var i = 1; i < target_array.length; i++) {
        var element = target_array[i];
        var value = func(element);
        if (value < smallest_value) {
            smallest_element = element;
            smallest_value = value;
        }
    }
    return smallest_element;
}

export function allElementsEqual(first, second, equalsFunc) {
    if (first == null) return second == null;
    else if (second == null) return false;
    else if (first.length != second.length) return false;
    else {
        for (var i = 0; i < first.length; i++) {
            if (!equalsFunc(first[i], second[i])) {
                return false;
            }
        }
        return true
    }
}