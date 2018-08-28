#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>

uint64_t modExp(uint64_t base, uint64_t exp, uint64_t mod) {
    uint64_t result = 1;
    while (exp > 0) {
        if ((exp & 1) == 1) {
            result = (result*base) % mod;
        }
        base = (base*base) % mod;
        exp >>= 1;
    }
    return result;
}

uint64_t modMul(uint64_t a, uint64_t b, uint64_t mod) {
    if ((a == 0) || (b < (mod / a))) return (a*b) % mod;
    uint64_t result = 0;
    a = a % mod;
    while (b > 0) {
        // if b is odd, add a to the result
        if ((b & 1) == 1) {
            result = (result + a) % mod;
        }
        a = (a<<1) % mod;
        b >>= 1;
    }
    return result;
}

int test(int a,int b) {
  return a+b;
}