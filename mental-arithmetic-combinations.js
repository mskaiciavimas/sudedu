function generateCombinations() {
  questionPool = [];
  questionPool2 = [];
  questionPool3 = [];
  questionPool4 = []
  remainder = 0;

  function neperzengiant(number1, number2) {
    num1 = number1.toString();
    num2 = number2.toString();
    const minDigits = Math.min(num1.length, num2.length);

    let neper = true;
    for (let i = 0; i < minDigits; i++) {
        const digit1 = parseInt(num1[num1.length - i - 1]);
        const digit2 = parseInt(num2[num2.length - i - 1]);

        if (digit1 + digit2 >= 10) {
            neper = false;
            break;
        }
    }
    return neper;
  }

  function neisardant (number1, number2) {
    num1 = number1.toString();
    num2 = number2.toString();
    const minDigits = Math.min(num1.length, num2.length);

    let neisard = true;
    for (let i = 0; i <= minDigits; i++) {
      const digit1 = parseInt(num1[num1.length - i]);
      const digit2 = parseInt(num2[num2.length - i]);

      if (digit1 < digit2) {
        neisard = false
        break;
      }
    }
    return neisard;
  }

  function hasNoCarrying(a, b) {
    // Convert the numbers to strings
    const aStr = a.toString();
    const bStr = b.toString();

    // Iterate over each digit of `b`
    for (let i = 0; i < bStr.length; i++) {
        const bDigit = parseInt(bStr[bStr.length - 1 - i], 10);
        let carry = 0;

        // Iterate over each digit of `a`
        for (let j = 0; j < aStr.length; j++) {
            const aDigit = parseInt(aStr[aStr.length - 1 - j], 10);

            // Calculate the product and add the carry
            const product = aDigit * bDigit + carry;

            // If any product exceeds 9, carrying happens
            if (product >= 10) {
                return false;
            }

            // Update carry for the next iteration
            carry = Math.floor(product / 10);
        }

        // If there's leftover carry, check it
        if (carry > 0) {
            return false;
        }
    }

    return true;
}


  function nuliaiIsEiles(number) {
    let inputNumber = String(number); // Convert the number to a string
    let digits = inputNumber.length;
    let numberOfZeroes = generateRandomNumber(2, digits - 1); // Random number of zeroes to replace
    let startPosition = generateRandomNumber(1, digits); // Random starting position (1-based index)

    while (digits - (startPosition) < numberOfZeroes) {
      numberOfZeroes = generateRandomNumber(2, digits - 1); // Random number of zeroes to replace
      startPosition = generateRandomNumber(1, digits); // Random starting position (1-based index)
    }

    // Replace the portion of the string with zeroes
    let modifiedNumber = inputNumber.slice(0, startPosition) + 
                          '0'.repeat(numberOfZeroes) + 
                          inputNumber.slice(startPosition + numberOfZeroes);

    return modifiedNumber; // Convert the modified string back to an integer
  }

  /*ADDITION*/
  if (controller.modeChoice === 'sudetis') {
    if (controller.modeChoice2 === 'viena10') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'viena') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
            if (11 <= number1 + number2 && number1 + number2 <= 19) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dvivien20') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 < 20) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      } else if (controller.modeChoice2 === 'dvivien') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 <= 100) {
                  questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
        } else if (controller.modeChoice2 === 'dvi') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 <= 100) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          } else if (controller.modeChoice2 === 'tukst') {
                while (questionPool.length < 20) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000) {
                      questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
            } else if (controller.modeChoice2 === 'dtukst') {
                  while (questionPool.length < 20) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 10000) {
                        questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
                controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
            } else if (controller.modeChoice2 === 'mil') {
              while (questionPool.length < 2) {
                number1 = generateRandomNumber(100001, 999999);
                number2 = generateRandomNumber(100001, 999999);
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
              while (questionPool.length < 8) {
                number1 = generateRandomNumber(100001, 999999);
                number2 = generateRandomNumber(10001, 99999);
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
              while (questionPool.length < 12) {
                number1 = generateRandomNumber(100001, 999999);
                number2 = generateRandomNumber(1001, 9999);
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
              while (questionPool.length < 13) {
                number1 = generateRandomNumber(100001, 999999);
                number2 = generateRandomNumber(11, 99);
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
              while (questionPool.length < 20) {
                number1 = generateRandomNumber(1001, 999999);
                number2 = generateRandomNumber(101, 999999);
                  if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          } 
      /*SUBTRACTION*/
      } else if (controller.modeChoice === 'atimtis') {
        if (controller.modeChoice2 === 'viena10') {
            for (let number1 = 1; number1 <= 9; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                 if (number1 > number2) {
                  questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

        } else if (controller.modeChoice2 === 'dvivien20') {
            for (let number1 = 10; number1 <= 19; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (neisardant(number1, number2) === controller.modeChoice3) {
                  questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      } else if (controller.modeChoice2 === 'dvivien') {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (neisardant(number1, number2) === controller.modeChoice3) {
                questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dvi') {
        for (let number1 = 10; number1 <= 99; number1++) {
          for (let number2 = 10; number2 <= 99; number2++) {
            if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
              questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'gretnul') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(1000, 99999);
      number2 = generateRandomNumber(1001, 9999);
        if (number1 > number2) {
          number1WithZeroes = parseInt(nuliaiIsEiles(number1));
          if (number1WithZeroes > number2) {
          questionPool.push([number1WithZeroes, parseInt(number2), "subtraction"]);
          }
      }
  }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'tukst') {
      while (questionPool.length < 20) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
          questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }
      controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dtukst') {
        while (questionPool.length < 20) {
          number1 =generateRandomNumber(1001, 9999)
          number2 =generateRandomNumber(101, 9999)
          if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }

      else if (controller.modeChoice2 === 'mil') {
        while (questionPool.length < 3) {
          number1 =generateRandomNumber(100000, 1000000)
          number2 =generateRandomNumber(101, 999)
          if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
        while (questionPool.length < 8) {
          number1 =generateRandomNumber(100000, 1000000)
          number2 =generateRandomNumber(1001, 9999)
          if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
        while (questionPool.length < 15) {
          number1 =generateRandomNumber(100000, 1000000)
          number2 =generateRandomNumber(10001, 99999)
          if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
      while (questionPool.length < 19) {
        number1 =generateRandomNumber(100000, 1000000)
        number2 =generateRandomNumber(100001, 999999)
        if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
          questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }
    while (questionPool.length < 20) {
      number1 =generateRandomNumber(10000, 99999)
      number2 =generateRandomNumber(10001, 99999)
      if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
        questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
    }
  }

        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
      
  /*ADDITION AND SUBTRACTION*/
  } else if (controller.modeChoice === 'sudetis ir atimtis') {
    if (controller.modeChoice2 === 'viena10') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 > number2) {
              questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
        questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
        controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'lent') {
        for (let number1 = 2; number1 <= 9; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 + number2 > 10) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        for (let number1 = 11; number1 <= 19; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
             if (parseInt(number1.toString()[1]) < number2) {
              questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
        controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random());
    } else if (controller.modeChoice2 === 'dvivien20') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 < 20) {
                questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
          }
          questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);

          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) > number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
      } else if (controller.modeChoice2 === 'dvivien') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 100) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (neisardant(number1, number2) === controller.modeChoice3) {
                  questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
      }
        else if (controller.modeChoice2 === 'dvi') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 100) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                  questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
           } else if (controller.modeChoice2 === 'tukst') {
                while (questionPool2.length < 10) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000) {
                      questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
                questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                while (questionPool3.length < 10) {
                  number1 =generateRandomNumber(101, 999)
                  number2 =generateRandomNumber(11, 999)
                  if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                    questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
        } 
        
        else if (controller.modeChoice2 === 'dtukst') {
                  while (questionPool2.length < 10) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 10000) {
                        questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
                  questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                  while (questionPool3.length < 10) {
                    number1 =generateRandomNumber(1001, 9999)
                    number2 =generateRandomNumber(101, 9999)
                    if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                      questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                  }
                }
                questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
                controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
          } 

          else if (controller.modeChoice2 === 'mil') {

            while (questionPool2.length < 1) {
              number1 = generateRandomNumber(100001, 999999);
              number2 = generateRandomNumber(100001, 999999);
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
            while (questionPool2.length < 4) {
              number1 = generateRandomNumber(100001, 999999);
              number2 = generateRandomNumber(10001, 99999);
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
            while (questionPool2.length < 6) {
              number1 = generateRandomNumber(100001, 999999);
              number2 = generateRandomNumber(1001, 9999);
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
            while (questionPool2.length < 7) {
              number1 = generateRandomNumber(100001, 999999);
              number2 = generateRandomNumber(11, 99);
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
            while (questionPool2.length < 10) {
              number1 = generateRandomNumber(1001, 999999);
              number2 = generateRandomNumber(101, 999999);
                if (neperzengiant(number1, number2) === controller.modeChoice3 && number1 + number2 < 1000000) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }


            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);


            while (questionPool3.length < 1) {
              number1 =generateRandomNumber(100000, 1000000)
              number2 =generateRandomNumber(101, 999)
              if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
            while (questionPool3.length < 3) {
              number1 =generateRandomNumber(100000, 1000000)
              number2 =generateRandomNumber(1001, 9999)
              if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
            while (questionPool3.length < 6) {
              number1 =generateRandomNumber(100000, 1000000)
              number2 =generateRandomNumber(10001, 99999)
              if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
          while (questionPool3.length < 9) {
            number1 =generateRandomNumber(100000, 1000000)
            number2 =generateRandomNumber(100001, 999999)
            if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
              questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
        while (questionPool3.length < 10) {
          number1 =generateRandomNumber(10000, 99999)
          number2 =generateRandomNumber(10001, 99999)
          if (neisardant(number1, number2) === controller.modeChoice3 && number1 > number2) {
            questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }

          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
    } 

/*MULTIPLICATION*/          
} else if (controller.modeChoice === 'daugyba') {
  if (controller.modeChoice2 === 'dauglent') {
    const firstNumber = controller.selectedNumbers[0];
    const secondNumber = controller.selectedNumbers[1];
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(11, 99);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtrivien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugketvien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(1001, 9999);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugdvidvi') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(11, 99);
      number2 = generateRandomNumber(11, 99);
      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtridvi') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(11, 99);
      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugketdvi') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(1001, 9999);
      number2 = generateRandomNumber(11, 99);
      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  }
  
  else if (controller.modeChoice2 === 'daugdaugvien') {
    while (questionPool.length < 6) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  while (questionPool.length < 14) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

  while (questionPool.length < 20) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  }

  else if (controller.modeChoice2 === 'daugdaugdvi') {
    while (questionPool.length < 6) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
    while (questionPool.length < 14) {

      interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
    while (questionPool.length < 20) {

      interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      if (number2 % 10 !== 0) {
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugdaug') {
    while (questionPool.length < 2) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool.length < 4) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool.length < 6) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool2.length < 2) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      if (number2 % 10 !== 0) {
      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }

  while (questionPool2.length < 6) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    if (number2 % 10 !== 0) {
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
}
  while (questionPool2.length < 8) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    if (number2 % 10 !== 0) {
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
  }


  while (questionPool3.length < 3) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(101, 999)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    if (number1 * number2 <= 1000000 && number2 % 10 !== 0) {
    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
}
  while (questionPool3.length < 6) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(101, 999)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    if (number1 * number2 <= 1000000 && number2 % 10 !== 0) {
    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
}

  controller.combinations = questionPool.concat(questionPool2, questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  }
  
  else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        if (Math.random() <= 0.5) {
          questionPool.push([parseInt(number2), parseInt(number1), "multiplication"]);
        } else {
          questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
      }
      for (let number1 = 1; number1 <= 10; number1++) {
        for (let number2 = 100; number2 <= 900; number2+=100) {
          if (Math.random() <= 0.5) {
            questionPool2.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    controller.combinations = [...questionPool.sort(() => 0.5 - Math.random()).slice(0, 10), ...questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10)];
  } else if (controller.modeChoice2 === 'pil') {
    let sublist10 = [];
    let sublist100 = [];
    let sublist1000 = [];
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 10; number2 <= 90; number2+=10) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10)) {
        if (Math.random() <= 0.5) {
          sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
        } else {
          sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
        }
      }
    }
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 100; number2 <= 900; number2+=10) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10 && number2 !== 100)) {
          if (Math.random() <= 0.5) {
            sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 1000; number2 <= 9000; number2+=100) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10 && number2 !== 100 && number2 !== 1000)) {
          if (Math.random() <= 0.5) {
            sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    controller.combinations = [...sublist10.sort(() => 0.5 - Math.random()).slice(0, 8), ...sublist100.sort(() => 0.5 - Math.random()).slice(0, 8), ...sublist1000.sort(() => 0.5 - Math.random()).slice(0, 4)];
  }
  
/*DIVISION*/
} else if (controller.modeChoice === 'dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    var firstNumber = parseInt(controller.selectedNumbers[0]);
    var secondNumber = parseInt(controller.selectedNumbers[1]);
    if (controller.withRemainder) {
      if (firstNumber === 1) {
        firstNumber = firstNumber + 1;
      }
      if (secondNumber === 1) {
        secondNumber = secondNumber + 1;
      }
    }

    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        if (controller.withRemainder) {
        if ((((number1 * number2) + remainder) % number1) !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool.length < 20) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (dalinys <= 99 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtrivien') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }

      dalinys = (number1 * number2) + remainder;

      if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }

  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }

    dalinys = (number1 * number2) + remainder;

    if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } 
  
  else if (controller.modeChoice2 === 'daugketvien') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(101, 9999);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }


  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(1001, 9999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtridvi') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(11, 99);
      let number2 = generateRandomNumber(2, 9);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }

  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugketdvi') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(11, 99);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
} 
  
  else if (controller.modeChoice2 === 'daugdaugvien') {
    while (questionPool.length < 3) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;
      if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  while (questionPool.length < 11) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool.length < 16) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 17) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (10000 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
} 





else if (controller.modeChoice2 === 'daugdaugviendalmnul') {

  function containsZero(number) {
    // Convert the number to a string and check if it contains '0'
    return String(number).includes('0');
  }

  while (questionPool.length < 3) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && containsZero(number2)) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool.length < 11) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0 && containsZero(number2)) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 16) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0 && containsZero(number2)) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}
while (questionPool.length < 17) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0 && containsZero(number2)) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}
while (questionPool.length < 20) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (10000 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0 && containsZero(number2)) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugdaugdvi') {
  while (questionPool.length < 6) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool.length < 14) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
}
  







  else if (controller.modeChoice2 === 'daugdaug') {
    while (questionPool.length < 3) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;
      if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
while (questionPool.length < 7) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 10) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

while (questionPool.length < 13) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 17) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

while (questionPool.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  }
  else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }

        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*10 !== 0) {
              questionPool.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
            }
          } else {
            questionPool.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
      
    }

      }

      for (let number1 = 1; number1 <= 10; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1*100)
          }
          dalinys = (number1 * number2 * 100) + remainder;
  
  
          if (controller.withRemainder) {
            if (dalinys % number1*100 !== 0) {
              questionPool2.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
            }
          } else {
            questionPool2.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
      
    }
  
      }
    
    controller.combinations = [...questionPool.sort(() => 0.5 - Math.random()).slice(0, 10), ...questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10)];
  } else if (controller.modeChoice2 === 'pil') {
    let sublist10 = [];
    let sublist100 = [];
    let sublist1000 = [];
    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }
        dalinys = (number1 * number2 * 10) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*10 !== 0) {
            sublist10.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
        } else {
          sublist10.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
        }
      }
    }
  }

    }

    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*100)
        }
        dalinys = (number1 * number2 * 100) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*100 !== 0) {
            sublist100.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
        } else {
          sublist100.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
        }
      }
    }
  }

    }

    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*1000)
        }
        dalinys = (number1 * number2 * 1000) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*1000 !== 0) {
            sublist1000.push([parseInt(number1 * number2 * 1000) + remainder, parseInt(number1 * 1000), "division"]);
          }
        } else {
          sublist1000.push([parseInt(number1 * number2 * 1000) + remainder, parseInt(number1 * 1000), "division"]);
        }
      }
    }
  }

    }
  
    controller.combinations = [...sublist10.sort(() => 0.5 - Math.random()).slice(0, 8), ...sublist100.sort(() => 0.5 - Math.random()).slice(0, 8), ...sublist1000.sort(() => 0.5 - Math.random()).slice(0, 4)];
  }


/*MULTIPLICATION AND DIVISION*/
} else if (controller.modeChoice === 'daugyba ir dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    var firstNumber = parseInt(controller.selectedNumbers[0]);
    var secondNumber = parseInt(controller.selectedNumbers[1]);
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
    
    if (controller.withRemainder) {
      if (firstNumber === 1) {
        firstNumber = firstNumber + 1;
      }
      if (secondNumber === 1) {
        secondNumber = secondNumber + 1;
      }
    }

    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        if (controller.withRemainder) {
        if ((((number1 * number2) + remainder) % number1) !== 0) {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }
    }

    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool2.length < 10) {
        let number1 = generateRandomNumber(11, 99);
        let number2 = generateRandomNumber(2, 9);
        questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
    while (questionPool3.length < 10) {
        let number1 = generateRandomNumber(2, 9);
        let number2 = generateRandomNumber(11, 99);
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        dalinys = (number1 * number2) + remainder;
        if (dalinys <= 99 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
          if (controller.withRemainder) {
            if (dalinys % number1 !== 0) {
          questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
            }
          } else {
            questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
      }
    }
    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugtrivien') {
  while (questionPool2.length < 10) {
      let number1 = generateRandomNumber(101, 999);
      let number2 = generateRandomNumber(2, 9);
      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }


  while (questionPool3.length < 10) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }

    dalinys = (number1 * number2) + remainder;

    if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

while (questionPool3.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }

  dalinys = (number1 * number2) + remainder;

  if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugketvien') {
  while (questionPool2.length < 10) {
      let number1 = generateRandomNumber(1001, 9999);
      let number2 = generateRandomNumber(2, 9);
      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  while (questionPool3.length < 10) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 9999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

while (questionPool3.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugtridvi') {
while (questionPool2.length < 10) {
    let number1 = generateRandomNumber(101, 999);
    let number2 = generateRandomNumber(11, 99);
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool3.length < 10) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(2, 9);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(11, 99);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;

if (dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugketdvi') {
while (questionPool2.length < 10) {
    let number1 = generateRandomNumber(1001, 9999);
    let number2 = generateRandomNumber(11, 99);
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool3.length < 10) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;

if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}
controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} 





else if (controller.modeChoice2 === 'daugdaugvien') {

  while (questionPool2.length < 6) {

    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool2.length < 14) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool2.length < 20) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}



while (questionPool3.length < 3) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 11) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}
while (questionPool3.length < 16) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 17) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 17) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (10000 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);

}

else if (controller.modeChoice2 === 'daugdaugdvi') {

  while (questionPool2.length < 6) {
    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
  while (questionPool2.length < 14) {
    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
  while (questionPool2.length < 20) {
    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }

  while (questionPool3.length < 6) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool3.length < 14) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
}


else if (controller.modeChoice2 === 'daugdaug') {
  while (questionPool2.length < 2) {

    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 6) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 8) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 10) {

    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool2.length < 13) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool2.length < 15) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}


while (questionPool2.length < 18) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(101, 999)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool2.length < 20) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(101, 999)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool3.length < 3) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 7) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 10) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 13) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(11, 99);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 17) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
} else {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}

while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
} else {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        if (Math.random() <= 0.5) {
          questionPool.push([parseInt(number2), parseInt(number1), "multiplication"]);
        } else {
          questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
      }
      for (let number1 = 1; number1 <= 10; number1++) {
        for (let number2 = 100; number2 <= 900; number2+=100) {
          if (Math.random() <= 0.5) {
            questionPool2.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }

        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*10 !== 0) {
              questionPool3.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
            }
          } else {
            questionPool3.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
      
    }

      }

      for (let number1 = 1; number1 <= 10; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1*100)
          }
          dalinys = (number1 * number2 * 100) + remainder;
  
  
          if (controller.withRemainder) {
            if (dalinys % number1*100 !== 0) {
              questionPool4.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
            }
          } else {
            questionPool4.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
      
    }
  
      }
    controller.combinations = [...questionPool.sort(() => 0.5 - Math.random()).slice(0, 5), ...questionPool2.sort(() => 0.5 - Math.random()).slice(0, 5), ...questionPool3.sort(() => 0.5 - Math.random()).slice(0, 5), ...questionPool4.sort(() => 0.5 - Math.random()).slice(0, 5)]
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 100; number2 <= 900; number2+=100) {
        questionPool2.push([parseInt(number2), parseInt(number1), "multiplication"]);
      }
    }
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*100)
        }
        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*100 !== 0) {
              questionPool3.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
            }
          } else {
            questionPool3.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
      
    }

      }
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil') {
    let sublist10 = [];
    let sublist100 = [];
    let sublist1000 = [];
    let sublist10Div = [];
    let sublist100Div = [];
    let sublist1000Div = [];
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 10; number2 <= 90; number2+=10) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10)) {
          if (Math.random() <= 0.5) {
            sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 100; number2 <= 900; number2+=10) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10 && number2 !== 100)) {
          if (Math.random() <= 0.5) {
            sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }
    for (let number1 = 2; number1 <= 90;) {
      if (number1 < 10) {
        number1++;
      } else {
        number1+=10;
      }
      for (let number2 = 1000; number2 <= 9000; number2+=100) {
        if (hasNoCarrying(number1, number2) && (number1 !== 10 && number1 !== 100 && number2 !== 10 && number2 !== 100 && number2 !== 1000)) {
          if (Math.random() <= 0.5) {
            sublist10.push([parseInt(number2), parseInt(number1), "multiplication"]);
          } else {
            sublist10.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
        }
      }
    }

    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }
        dalinys = (number1 * number2 * 10) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*10 !== 0) {
            sublist10Div.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
        } else {
          sublist10Div.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
        }
      }
    }
  }

    }

    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*100)
        }
        dalinys = (number1 * number2 * 100) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*100 !== 0) {
            sublist100Div.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
        } else {
          sublist100Div.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
        }
      }
    }
  }

    }

    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 90; number2++) {
        if (hasNoCarrying(number1, number2)) {
        if (Number(String(number1 * number2)[0]) !== Number(String(number1)[0])) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*1000)
        }
        dalinys = (number1 * number2 * 1000) + remainder;

        if (controller.withRemainder) {
          if (dalinys % number1*1000 !== 0) {
            sublist1000Div.push([parseInt(number1 * number2 * 1000) + remainder, parseInt(number1 * 1000), "division"]);
          }
        } else {
          sublist1000Div.push([parseInt(number1 * number2 * 1000) + remainder, parseInt(number1 * 1000), "division"]);
        }
      }
    }
  }

    }
      controller.combinations = [...sublist10.sort(() => 0.5 - Math.random()).slice(0, 4), ...sublist100.sort(() => 0.5 - Math.random()).slice(0, 3), ...sublist1000.sort(() => 0.5 - Math.random()).slice(0, 3), ...sublist10Div.sort(() => 0.5 - Math.random()).slice(0, 4), ...sublist100Div.sort(() => 0.5 - Math.random()).slice(0, 3), ...sublist1000Div.sort(() => 0.5 - Math.random()).slice(0, 3)];
    }
  
/*ALL*/
} else if (controller.modeChoice === "visi") {
  if (controller.modeChoice2 === "iki10") {
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 + number2 <= 10) {
          questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
        }
      }
    }
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 > number2) {
          questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
    }
    questionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool.concat(questionPool2).sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === "iki20") {
    for (let number1 = 11; number1 <= 19; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (11 <= number1 + number2 && number1 + number2 <= 19) {
          if (Math.random() < 0.5) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
        } else {
            questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
        }
    }
        }
      }

    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (11 <= number1 + number2 && number1 + number2 <= 19) {
          questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
        }
      }
    }

      for (let number1 = 11; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (parseInt(number1.toString()[1]) < number2) {
            questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
      }

      for (let number1 = 11; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (parseInt(number1.toString()[1]) > number2) {
            questionPool4.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
      }


      let shuffledQuestionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 2);
      let shuffledQuestionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 8);
      let combinedPool = shuffledQuestionPool.concat(shuffledQuestionPool2);

      let shuffledQuestionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 2);
      let shuffledQuestionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 8);
      let combinedPool2 = shuffledQuestionPool3.concat(shuffledQuestionPool4);

      controller.combinations = combinedPool.concat(combinedPool2).sort(() => 0.5 - Math.random()).slice(0, 20);
    
  } else if (controller.modeChoice2 === "iki100") {

    for (let number1 = 11; number1 <= 99; number1++) {
      for (let number2 = 11; number2 <= 99; number2++) {
        if (neperzengiant(number1, number2) && number1 + number2 <= 100) {
            if (Math.random() < 0.5) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
          } else {
              questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
          }
        }
    }
        }
      

    for (let number1 = 11; number1 <= 99; number1++) {
      for (let number2 = 11; number2 <= 99; number2++) {
        if (!neperzengiant(number1, number2) && number1 + number2 <= 100) {
          if (number1 + number2 <= 100) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
          }
        }
      }
    }


      for (let number1 = 11; number1 <= 99; number1++) {
        for (let number2 = 2; number2 <= 99; number2++) {
          if (neisardant(number1, number2) && number1 > number2) {
            questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
    }
      

      for (let number1 = 11; number1 <= 99; number1++) {
        for (let number2 = 2; number2 <= 99; number2++) {
          if (!neisardant(number1, number2) && number1 > number2) {
              questionPool4.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
        }
      }

      let shuffledQuestionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 1);
      let shuffledQuestionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 4);
      let combinedPool = shuffledQuestionPool.concat(shuffledQuestionPool2);

      let shuffledQuestionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 1);
      let shuffledQuestionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 4);
      let combinedPool2 = shuffledQuestionPool3.concat(shuffledQuestionPool4);

    let combinedPool3 = [];
    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 2; number2 <= 9; number2++) {
        if (number1 * number2 < 100) {
          combinedPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
  }

  let combinedPool4 = [];

  for (let number1 = 2; number1 <= 10; number1++) {
    for (let number2 = 2; number2 <= 10; number2++) {
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      if (controller.withRemainder) {
      if ((((number1 * number2) + remainder) % number1) !== 0) {
        combinedPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      combinedPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  }
  }

    combinedPool3 = combinedPool3.sort(() => 0.5 - Math.random()).slice(0, 5);
    combinedPool4 = combinedPool4.sort(() => 0.5 - Math.random()).slice(0, 5);    

    controller.combinations = combinedPool.concat(combinedPool2, combinedPool3, combinedPool4).sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === "iki1000") {

      while (questionPool.length < 1) {
        number1 = generateRandomNumber(101, 999);
        number2 = generateRandomNumber(11, 999);
          if (neperzengiant(number1, number2) && number1 + number2 <= 1000) {
              if (Math.random() < 0.5) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            } else {
                questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
            }
      }
    }

    while (questionPool.length < 5) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(11, 999);
        if (!neperzengiant(number1, number2) && number1 + number2 <= 1000) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
    }
  }

      while (questionPool2.length < 1) {
        number1 = generateRandomNumber(101, 999);
        number2 = generateRandomNumber(11, 999);
        if (neisardant(number1, number2) && number1 > number2) {

            questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);

        
    }
  }

  while (questionPool2.length < 5) {
    number1 = generateRandomNumber(101, 999);
    number2 = generateRandomNumber(11, 999);
    if (!neisardant(number1, number2) && number1 > number2) {
        questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
}
}

      while (questionPool3.length < 2) {
        interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
        number1 = Math.max(...interNumbers);
        number2 = Math.min(...interNumbers);
        if (number1 * number2 <= 1000) {
        questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
    }

    while (questionPool3.length < 5) {
      interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);
      if (number1 * number2 <= 1000) {
      questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
        while (questionPool4.length < 2) {
          let number1 = generateRandomNumber(2, 9);
          let number2 = generateRandomNumber(11, 99);
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1)
          }
          let dalinys = number1 * number2;

          if (dalinys < 1000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
              questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      }


      while (questionPool4.length < 4) {
        let number1 = generateRandomNumber(2, 9);
        let number2 = generateRandomNumber(101, 999);
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        let dalinys = number1 * number2;

        if (dalinys < 1000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
            questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }


      let tens = [];
      let hundreds = [];
      for (let number1 = 2; number1 <= 10; number1++) {
        for (let number2 = 2; number2 <= 9; number2++) {
          if (number1 * number2 * 10 < 1000) {
            tens.push([parseInt(number1 * number2 * 10), parseInt(number1* 10), "division"]);
        }
      }
    }
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 100 < 1000) {
              hundreds.push([parseInt(number1 * number2 * 100), parseInt(number1 * 100), "division"]);
          }  
      }
    }
      
      let randomArray = Math.random() < 0.5 ? tens : hundreds;
      let randomIndex = Math.floor(Math.random() * randomArray.length);
      let randomElement = randomArray[randomIndex];
      questionPool4.push(randomElement);
  
      controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4).sort(() => 0.5 - Math.random()).slice(0, 20);

      } else if (controller.modeChoice2 === "iki10000") {
      
        while (questionPool.length < 1) {
          number1 = generateRandomNumber(1001, 9999);
          number2 = generateRandomNumber(11, 9999);
            if (neperzengiant(number1, number2) && number1 + number2 < 10000) {

                if (Math.random() < 0.5) {
                  questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
              } else {
                  questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
              }

        }
      }
  
      while (questionPool.length < 3) {
        number1 = generateRandomNumber(1001, 9999);
        number2 = generateRandomNumber(11, 999);
          if (!neperzengiant(number1, number2) && number1 + number2 <= 10000) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
      }
    }

    while (questionPool.length < 5) {
      number1 = generateRandomNumber(101, 9999);
      number2 = generateRandomNumber(11, 9999);
        if (!neperzengiant(number1, number2) && number1 + number2 <= 10000) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
    }
  }
  
        while (questionPool2.length < 1) {
          number1 =generateRandomNumber(1001, 9999)
          number2 =generateRandomNumber(11, 9999)
          if (neisardant(number1, number2) && number1 > number2) {
              questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }
  
    while (questionPool2.length < 3) {
      number1 =generateRandomNumber(1001, 9999)
      number2 =generateRandomNumber(11, 999)
      if (!neisardant(number1, number2) && number1 > number2) {
          questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
  }
  }

  while (questionPool2.length < 5) {
    number1 =generateRandomNumber(1001, 9999)
    number2 =generateRandomNumber(11, 9999)
    if (!neisardant(number1, number2) && number1 > number2) {
        questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
}
}
  
        while (questionPool3.length < 2) {
          interNumbers = [generateRandomNumber(101, 9999), generateRandomNumber(2, 9)];
          number1 = Math.max(...interNumbers);
          number2 = Math.min(...interNumbers);
          if (number1 * number2 <= 10000) {
          questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
      }
  
      while (questionPool3.length < 5) {
        interNumbers = [generateRandomNumber(101, 9999), generateRandomNumber(11, 99)];
        number1 = Math.max(...interNumbers);
        number2 = Math.min(...interNumbers);
        if (number1 * number2 <= 10000) {
        questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
    }

          while (questionPool4.length < 2) {
            let number1 = generateRandomNumber(2, 9);
            let number2 = generateRandomNumber(11, 999);
            if (controller.withRemainder) {
              remainder = generateRandomNumber(1, number1)
            }
            let dalinys = number1 * number2;
  
            if (dalinys < 10000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
                questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        }
  
  
        while (questionPool4.length < 4) {
          let number1 = generateRandomNumber(2, 9);
          let number2 = generateRandomNumber(101, 9999);
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1)
          }
          let dalinys = number1 * number2;
  
          if (dalinys < 10000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
              questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      }
  
        let tens = [];
        let hundreds = [];
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 10 < 10000) {
              tens.push([parseInt(number1 * number2 * 10), parseInt(number1* 10), "division"]);
          }
        }
      }
          for (let number1 = 2; number1 <= 10; number1++) {
            for (let number2 = 2; number2 <= 9; number2++) {
              if (number1 * number2 * 100 < 10000) {
                hundreds.push([parseInt(number1 * number2 * 100), parseInt(number1 * 100), "division"]);
            }  
        }
      }
        
        let randomArray = Math.random() < 0.5 ? tens : hundreds;
        let randomIndex = Math.floor(Math.random() * randomArray.length);
        let randomElement = randomArray[randomIndex];
        questionPool4.push(randomElement);
    
        controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4).sort(() => 0.5 - Math.random()).slice(0, 20);
        }

        else if (controller.modeChoice2 === "iki1000000") {
      
          while (questionPool.length < 1) {
            number1 = generateRandomNumber(100001, 999999);
            number2 = generateRandomNumber(100001, 999999);
              if (!neperzengiant(number1, number2) && number1 + number2 < 1000000) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
          while (questionPool.length < 2) {
            number1 = generateRandomNumber(100001, 999999);
            number2 = generateRandomNumber(10001, 99999);
              if (!neperzengiant(number1, number2) && number1 + number2 < 1000000) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
          while (questionPool.length < 3) {
            number1 = generateRandomNumber(100001, 999999);
            number2 = generateRandomNumber(1001, 9999);
              if (!neperzengiant(number1, number2) && number1 + number2 < 1000000) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
          while (questionPool.length < 4) {
            number1 = generateRandomNumber(100001, 999999);
            number2 = generateRandomNumber(11, 99);
              if (!neperzengiant(number1, number2) && number1 + number2 < 1000000) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
          while (questionPool.length < 5) {
            number1 = generateRandomNumber(1001, 999999);
            number2 = generateRandomNumber(101, 999999);
              if (!neperzengiant(number1, number2) && number1 + number2 < 1000000) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
    
          while (questionPool2.length < 1) {
            number1 =generateRandomNumber(100000, 1000000)
            number2 =generateRandomNumber(101, 999)
            if (!neisardant(number1, number2) && number1 > number2) {
              questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
          while (questionPool2.length < 2) {
            number1 =generateRandomNumber(100000, 1000000)
            number2 =generateRandomNumber(1001, 9999)
            if (!neisardant(number1, number2) && number1 > number2) {
              questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
          while (questionPool2.length < 3) {
            number1 =generateRandomNumber(100000, 1000000)
            number2 =generateRandomNumber(10001, 99999)
            if (!neisardant(number1, number2) && number1 > number2) {
              questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
        while (questionPool2.length < 4) {
          number1 =generateRandomNumber(100000, 1000000)
          number2 =generateRandomNumber(100001, 999999)
          if (!neisardant(number1, number2) && number1 > number2) {
            questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
      while (questionPool2.length < 5) {
        number1 =generateRandomNumber(10000, 99999)
        number2 =generateRandomNumber(10001, 99999)
        if (!neisardant(number1, number2) && number1 > number2) {
          questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }

    while (questionPool3.length < 1) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } 

  while (questionPool3.length < 2) {

    interNumbers = [generateRandomNumber(10001, 99999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } 

  while (questionPool3.length < 3) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
  while (questionPool3.length < 4) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  while (questionPool3.length < 7) {

    interNumbers = [generateRandomNumber(10001, 99999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    if (number1 * number2 <= 1000000) {
    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
  }

  while (questionPool4.length < 1) {
    let number1 = generateRandomNumber(4, 9);
    let number2 = generateRandomNumber(10001, 99999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 1000000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
  }
  while (questionPool4.length < 2) {
    let number1 = generateRandomNumber(4, 9);
    let number2 = generateRandomNumber(1001, 9999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 1000000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
  }
      controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4).sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    }
      }

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
