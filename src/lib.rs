//! NexSight - Memory layer library for AI agents
//!
//! A library for managing memory in AI agent applications.

/// Prints a greeting from NexSight
pub fn hello() {
    println!("Hello, NexSight!");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hello() {
        hello();
    }
}
