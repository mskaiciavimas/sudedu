function generateCombinations() {
  questionPool = [];
  questionPool2 = [];
  questionPool3 = []
  /*ADDITION*/
  if (controller.modeChoice === 'sudetis') {
    if (controller.modeChoice2 === 'viena10') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool.push([number1, number2, "addition"]);
            }
          }
        }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else if (controller.modeChoice2 === 'viena') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
            if (11 <= number1 + number2 && number1 + number2 <= 19) {
              questionPool.push([number1, number2, "addition"]);
            }
          }
        }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else if (controller.modeChoice2 === 'dvivien20') {
      if (controller.modeChoice3 === 'neper') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 <= 20) {
                questionPool.push([number1, number2, "addition"]);
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
        }
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 < 10 && number1 + number2 < 100) {
                  questionPool.push([number1, number2, "addition"]);
                }
              }
            }
          } else if (controller.modeChoice3 === 'per10') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 > 10 && number1 + number2 < 100) {
                  questionPool.push([number1, number2, "addition"]);
                }
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
        } else if (controller.modeChoice2 === 'dvi') {
          if (controller.modeChoice3 === 'neper') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) < 10 && number1 + number2 < 100) {
                    questionPool.push([number1, number2, "addition"]);
                  }
                }
              }
            } else if (controller.modeChoice3 === 'per10') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 1; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) > 10 && number1 + number2 < 100) {
                    questionPool.push([number1, number2, "addition"]);
                  }
                }
              }
            } 
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          } else if (controller.modeChoice2 === 'tukst') {
            if (controller.modeChoice3 === 'neper') {
                while (questionPool.length < 20) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && number1 + number2 < 1000) {
                      questionPool.push([number1, number2, "addition"]);
                  }
                }
            } else if (controller.modeChoice3 === 'per10') {
                  while (questionPool.length < 20) {
                    number1 = generateRandomNumber(101, 999);
                    number2 = generateRandomNumber(11, 999);
                      if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10) && number1 + number2 < 1000) {
                        questionPool.push([number1, number2, "addition"]);
                  }
                }
              }
              controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
            } else if (controller.modeChoice2 === 'dtukst') {
              if (controller.modeChoice3 === 'neper') {
                  while (questionPool.length < 20) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) < 10 &&number1 + number2 < 10000) {
                        questionPool.push([number1, number2, "addition"]);
                    }
                  }
              } else if (controller.modeChoice3 === 'per10') {
                    while (questionPool.length < 20) {
                      number1 = generateRandomNumber(1001, 9999);
                      number2 = generateRandomNumber(101, 9999);
                        if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10 || parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) > 10) && number1 + number2 < 10000) {
                          questionPool.push([number1, number2, "addition"]);
                    }
                  }
                }
                controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
              } 
      /*SUBTRACTION*/
      } else if (controller.modeChoice === 'atimtis') {
        if (controller.modeChoice2 === 'viena10') {
          if (controller.modeChoice3 === "neper") {
            for (let number1 = 1; number1 <= 9; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                 if (number1 > number2) {
                  questionPool.push([number1, number2, "subtraction"]);
                }
              }
            }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          }

        } else if (controller.modeChoice2 === 'dvivien20') {
          if (controller.modeChoice3 === "neper") {
            for (let number1 = 10; number1 <= 19; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) > number2) {
                  questionPool.push([number1, number2, "subtraction"]);
                }
              }
            }
          } if (controller.modeChoice3 === "per10") {
            for (let number1 = 10; number1 <= 19; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) < number2) {
                  questionPool.push([number1, number2, "subtraction"]);
                }
              }
            }
          }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === "neper") {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) > number2) {
                questionPool.push([number1, number2, "subtraction"]);
              }
            }
          }
        } if (controller.modeChoice3 === "per10") {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) < number2) {
                questionPool.push([number1, number2, "subtraction"]);
              }
            }
          }
        }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dvi') {
      if (controller.modeChoice3 === "neper") {
        for (let number1 = 10; number1 <= 99; number1++) {
          for (let number2 = 10; number2 <= 99; number2++) {
            if (parseInt(number1.toString()[1]) > parseInt(number2.toString()[1]) && parseInt(number1.toString()[0]) > parseInt(number2.toString()[0]) && number1 > number2) {
              questionPool.push([number1, number2, "subtraction"]);
            }
          }
        }
      } if (controller.modeChoice3 === "per10") {
        for (let number1 = 10; number1 <= 99; number1++) {
          for (let number2 = 10; number2 <= 99; number2++) {
            if (parseInt(number1.toString()[1]) < parseInt(number2.toString()[1]) && number1 > number2) {
              questionPool.push([number1, number2, "subtraction"]);
            }
          }
        }
      }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'tukst') {
    if (controller.modeChoice3 === "neper") {
      while (questionPool.length < 20) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && number1 > number2) {
          questionPool.push([number1, number2, "subtraction"]);
      }
    }
    } if (controller.modeChoice3 === "per10") {
      while (questionPool.length < 20) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0])) && number1 > number2) {
          questionPool.push([number1, number2, "subtraction"]);
      }
    }
  }
      controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dtukst') {
      if (controller.modeChoice3 === "neper") {
        while (questionPool.length < 20) {
          number1 =generateRandomNumber(1001, 9999)
          number2 =generateRandomNumber(101, 9999)
          if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && parseInt(number1.toString().slice(-3)[0]) > parseInt(number2.toString().slice(-3)[0]) && number1 > number2) {
            questionPool.push([number1, number2, "subtraction"]);
        }
      }
      } if (controller.modeChoice3 === "per10") {
        while (questionPool.length < 20) {
          number1 =generateRandomNumber(101, 999)
          number2 =generateRandomNumber(11, 999)
          if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0]) || parseInt(number1.toString().slice(-3)[0]) < parseInt(number2.toString().slice(-3)[0])) && number1 > number2) {
            questionPool.push([number1, number2, "subtraction"]);
        }
      }
    }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
  /*ADDITION AND SUBTRACTION*/
  } else if (controller.modeChoice === 'sudetis ir atimtis') {
    if (controller.modeChoice2 === 'viena10') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool2.push([number1, number2, "addition"]);
            }
          }
        }
        questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 > number2) {
              questionPool3.push([number1, number2, "subtraction"]);
            }
          }
        }
        questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
        controller.combinations = questionPool2.concat(questionPool3);
      }
    } else if (controller.modeChoice2 === 'lent') {
      if (controller.modeChoice3 === 'per10') {
        for (let number1 = 2; number1 <= 9; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 + number2 > 10) {
              questionPool2.push([number1, number2, "addition"]);
            }
          }
        }
        for (let number1 = 11; number1 <= 19; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
             if (parseInt(number1.toString()[1]) < number2) {
              questionPool3.push([number1, number2, "subtraction"]);
            }
          }
        }
        controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random());
      }
    } else if (controller.modeChoice2 === 'dvivien20') {
      if (controller.modeChoice3 === 'neper') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 <= 20) {
                questionPool2.push([number1, number2, "addition"]);
              }
            }
          }
          questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);

          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) > number2) {
                questionPool3.push([number1, number2, "subtraction"]);
              }
            }
          }
          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3);
        }
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 < 10 && number1 + number2 < 100) {
                  questionPool2.push([number1, number2, "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) > number2) {
                  questionPool3.push([number1, number2, "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3);
        } else if (controller.modeChoice3 === 'per10') {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) + number2 > 10 && number1 + number2 < 100) {
                questionPool2.push([number1, number2, "addition"]);
              }
            }
          }
          questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);

          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) < number2) {
                questionPool3.push([number1, number2, "subtraction"]);
              }
            }
          }
          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3);
        }
      }
        else if (controller.modeChoice2 === 'dvi') {
          if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) < 10 && number1 + number2 < 100) {
                  questionPool2.push([number1, number2, "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (parseInt(number1.toString()[1]) > parseInt(number2.toString()[1]) && number1 > number2) {
                  questionPool3.push([number1, number2, "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3);
            
            } else if (controller.modeChoice3 === 'per10') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) > 10 && number1 + number2 < 100) {
                    questionPool2.push([number1, number2, "addition"]);
                  }
                }
              }
              questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) < parseInt(number2.toString()[1]) && number1 > number2) {
                    questionPool3.push([number1, number2, "subtraction"]);
                  }
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3);
            }
           } else if (controller.modeChoice2 === 'tukst') {
            if (controller.modeChoice3 === 'neper') {
                while (questionPool2.length < 10) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 &&number1 + number2 < 1000) {
                      questionPool2.push([number1, number2, "addition"]);
                  }
                }
                questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                while (questionPool3.length < 10) {
                  number1 =generateRandomNumber(101, 999)
                  number2 =generateRandomNumber(11, 999)
                  if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && number1 > number2) {
                    questionPool3.push([number1, number2, "subtraction"]);
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3);

            } else if (controller.modeChoice3 === 'per10') {
                while (questionPool2.length < 10) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                  if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10) && number1 + number2 < 1000) {
                    questionPool2.push([number1, number2, "addition"]);
                  }
                }
                questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                while (questionPool3.length < 10) {
                  number1 =generateRandomNumber(101, 999)
                  number2 =generateRandomNumber(11, 999)
                  if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0])) && number1 > number2) {
                    questionPool3.push([number1, number2, "subtraction"]);
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3);
          }
        } 
        
        else if (controller.modeChoice2 === 'dtukst') {
              if (controller.modeChoice3 === 'neper') {
                  while (questionPool2.length < 10) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) < 10 &&number1 + number2 < 10000) {
                        questionPool2.push([number1, number2, "addition"]);
                    }
                  }
                  questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                  while (questionPool3.length < 10) {
                    number1 =generateRandomNumber(1001, 9999)
                    number2 =generateRandomNumber(101, 9999)
                    if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && parseInt(number1.toString().slice(-3)[0]) > parseInt(number2.toString().slice(-3)[0]) && number1 > number2) {
                      questionPool3.push([number1, number2, "subtraction"]);
                  }
                }
                questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
                controller.combinations = questionPool2.concat(questionPool3);

              } else if (controller.modeChoice3 === 'per10') {
                  while (questionPool2.length < 10) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                    if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10 || parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) > 10) && number1 + number2 < 10000) {
                      questionPool2.push([number1, number2, "addition"]);
                    }
                  }
                  questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                  while (questionPool3.length < 10) {
                    number1 =generateRandomNumber(1001, 9999)
                    number2 =generateRandomNumber(101, 9999)
                    if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0]) || parseInt(number1.toString().slice(-3)[0]) < parseInt(number2.toString().slice(-3)[0])) && number1 > number2) {
                      questionPool3.push([number1, number2, "subtraction"]);
                  }
                }
                questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
                controller.combinations = questionPool2.concat(questionPool3);
            }
          } 
/*MULTIPLICATION*/          
} else if (controller.modeChoice === 'daugyba') {
  if (controller.modeChoice2 === 'dauglent') {
    const firstNumber = controller.selectedNumbers[0];
    const secondNumber = controller.selectedNumbers[1];
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool.push([number1, number2, "multiplication"]);
      }
    }
    controller.combinations = questionPool;
  } else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        questionPool.push([number1, number2, "multiplication"]);
        questionPool.push([number2, number1, "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 100; number2 <= 900; number2+=100) {
        questionPool.push([number2, number1, "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  }
  
/*DIVISION*/
} else if (controller.modeChoice === 'dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    const firstNumber = controller.selectedNumbers[0];
    const secondNumber = controller.selectedNumbers[1];
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool.push([number1 * number2, number1, "division"]);
      }
    }
    controller.combinations = questionPool;
  } else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        questionPool.push([number1 * number2 * 10, number1 * 10, "division"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        questionPool.push([number1 * number2 * 100, number1 * 100, "division"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  }
/*MULTIPLICATION AND DIVISION*/
} else if (controller.modeChoice === 'daugyba ir dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    const firstNumber = controller.selectedNumbers[0];
    const secondNumber = controller.selectedNumbers[1];
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool2.push([number1, number2, "multiplication"]);
      }
    }
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool3.push([number1 * number2, number1, "division"]);
      }
  }
    controller.combinations = questionPool2.concat(questionPool3);
  } else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        questionPool2.push([number1, number2, "multiplication"]);
        questionPool2.push([number2, number1, "multiplication"]);
      }
    }
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        questionPool3.push([number1 * number2 * 10, number1 * 10, "division"]);
      }
    }
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool2.concat(questionPool3);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 100; number2 <= 900; number2+=100) {
        questionPool2.push([number1, number2, "multiplication"]);
        questionPool2.push([number2, number1, "multiplication"]);
      }
    }
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        questionPool3.push([number1 * number2 * 100, number1 * 100, "division"]);
      }
    }
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool2.concat(questionPool3);
  }
/*ALL*/
} else if (controller.modeChoice === "visi") {
  if (controller.modeChoice2 === "iki10") {
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 + number2 <= 10) {
          questionPool.push([number1, number2, "addition"]);
        }
      }
    }
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 > number2) {
          questionPool2.push([number1, number2, "subtraction"]);
        }
      }
    }
    questionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool.concat(questionPool2);
  } else if (controller.modeChoice2 === "iki20") {
      for (let number1 = 1; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 19; number2++) {
           if (number1 + number2 < 20) {
            questionPool.push([number1, number2, "addition"]);
          }
        }
      }
      for (let number1 = 1; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 19; number2++) {
           if (number1 > number2) {
            questionPool2.push([number1, number2, "subtraction"]);
          }
        }
      }
      questionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 10);
      questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
      controller.combinations = questionPool.concat(questionPool2);
  } else if (controller.modeChoice2 === "iki100") {
    questionPool4 = [];
    for (let number1 = 1; number1 <= 99; number1++) {
      for (let number2 = 1; number2 <= 99; number2++) {
        if (number1 + number2 < 100) {
          questionPool.push([number1, number2, "addition"]);
        }
      }
    }
    for (let number1 = 1; number1 <= 99; number1++) {
      for (let number2 = 1; number2 <= 99; number2++) {
        if (number1 > number2) {
          questionPool2.push([number1, number2, "subtraction"]);
        }
      }
    }
    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 2; number2 <= 9; number2++) {
        if (number1 * number2 < 100) {
        questionPool3.push([number1, number2, "multiplication"]);
      }
    }
  }
    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 2; number2 <= 9; number2++) {
        if (number1 * number2 < 100) {
        questionPool4.push([number1 * number2, number1, "division"]);
      }
    }
  }
    questionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 5);
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 5);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 5);
    questionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 5);    

    controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4);
    } else if (controller.modeChoice2 === "iki1000") {
      questionPool4 = [];

      while (questionPool.length < 5) {
        number1 = generateRandomNumber(101, 999);
        number2 = generateRandomNumber(11, 999);
          if (number1 + number2 < 1000) {
            questionPool.push([number1, number2, "addition"]);
      }
    }
      while (questionPool2.length < 5) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if (number1 > number2) {
          questionPool2.push([number1, number2, "subtraction"]);
    }
  }
      for (let number1 = 2; number1 <= 9; number1++) {
        for (let number2 = 120; number2 <= 980; number2+=20) {
          if (number1 * number2 < 1000) {
            questionPool3.push([number1, number2, "multiplication"]);
            questionPool3.push([number2, number1, "multiplication"]);
          }
        }
      }

      for (let number1 = 2; number1 <= 10; number1++) {
        for (let number2 = 2; number2 <= 9; number2++) {
          if (number1 * number2 * 10 < 1000) {
          questionPool4.push([number1 * number2 * 10, number1* 10, "division"]);
        }
      }
    }
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 100 < 1000) {
            questionPool4.push([number1 * number2 * 100, number1 * 100, "division"]);
          }  
      }
    }
      questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 5);
      questionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 5);    
  
      controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4);
      } else if (controller.modeChoice2 === "iki10000") {
        questionPool4 = [];
  
        while (questionPool.length < 5) {
          number1 = generateRandomNumber(101, 9999);
          number2 = generateRandomNumber(11, 9999);
            if (number1 + number2 < 10000) {
              questionPool.push([number1, number2, "addition"]);
        }
      }
        while (questionPool2.length < 5) {
          number1 =generateRandomNumber(101, 9999)
          number2 =generateRandomNumber(11, 9999)
          if (number1 > number2) {
            questionPool2.push([number1, number2, "subtraction"]);
      }
    }
        for (let number1 = 20; number1 <= 90; number1+=10) {
          for (let number2 = 20; number2 <= 980; number2+=10) {
            if (number1 * number2 < 10000) {
              questionPool3.push([number1, number2, "multiplication"]);
              questionPool3.push([number2, number1, "multiplication"]);
            }
          }
        }
  
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 100 < 10000) {
            questionPool4.push([number1 * number2 * 100, number1 * 100, "division"]);
          }
        }
      }
          for (let number1 = 2; number1 <= 10; number1++) {
            for (let number2 = 2; number2 <= 9; number2++) {
              if (number1 * number2 * 1000 < 10000) {
              questionPool4.push([number1 * number2 * 1000, number1 * 1000, "division"]);
            }  
        }
      }
        questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 5);
        questionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 5);    
    
        controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4);
        }
  }
    }
  

  



  

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}