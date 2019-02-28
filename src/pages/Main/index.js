import React, { Component } from "react";
import api from "../../services/api";
import moment from "moment";

import logo from "../../assets/logo.png";

import { Container, Form } from "./styles";

import CompareList from "../../components/CompareList";

export class Main extends Component {
    state = {
        loading: false,
        repositoryInput: "",
        repositoryError: false,
        repositories:
            JSON.parse(localStorage.getItem("@app02:repositories")) || []
    };

    handleAddRepository = async e => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            const { data: repository } = await api.get(
                `/repos/${this.state.repositoryInput}`
            );

            repository.lastCommit = moment(repository.pushed_at).fromNow();

            this.setState(
                {
                    repositoryInput: "",
                    repositoryError: false,
                    repositories: [...this.state.repositories, repository]
                },
                this.setLocalStorage
            );
        } catch (err) {
            this.setState({ repositoryError: true });
        } finally {
            this.setState({ loading: false });
        }
    };

    handleRefreshRepository = async rep => {
        const { data: repository } = await api.get(`/repos/${rep.full_name}`);
        repository.lastCommit = moment(repository.pushed_at).fromNow();

        const updatedRepository = this.state.repositories.map(ele => {
            return repository.full_name === ele.full_name ? repository : ele;
        });
        this.setState(
            {
                repositories: updatedRepository
            },
            this.setLocalStorage
        );
    };

    handleDeleteRepository = async rep => {
        const updatedRepository = this.state.repositories.filter(ele => {
            return rep.full_name !== ele.full_name;
        });
        this.setState(
            {
                repositories: updatedRepository
            },
            this.setLocalStorage
        );
    };

    async setLocalStorage() {
        await localStorage.setItem(
            "@app02:repositories",
            JSON.stringify(this.state.repositories)
        );
    }

    render() {
        return (
            <Container>
                <img src={logo} alt="Github Compare" />
                <Form
                    withError={this.state.repositoryError}
                    onSubmit={this.handleAddRepository}
                >
                    <input
                        type="text"
                        placeholder="usuário/repositório"
                        value={this.state.repositoryInput}
                        onChange={e =>
                            this.setState({ repositoryInput: e.target.value })
                        }
                    />
                    <button type="submit">
                        {this.state.loading ? (
                            <i className="fa fa-spinner fa-pulse" />
                        ) : (
                            "OK"
                        )}
                    </button>
                </Form>
                <CompareList
                    repositories={this.state.repositories}
                    refresh={this.handleRefreshRepository}
                    del={this.handleDeleteRepository}
                />
            </Container>
        );
    }
}

export default Main;
